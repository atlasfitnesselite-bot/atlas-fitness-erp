import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Plus, Search, Users, ArrowLeft, Check, CheckCheck, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import io from 'socket.io-client';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const ChatPage = () => {
  const { user, token } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState('');
  
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 'MEDIUM'
  });
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    fetchEmployees();
    const newSocket = io('/chat');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg) => {
        if (activeRoom && msg.roomId === activeRoom.id) {
          setMessages((prev) => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        } else {
          if (msg.senderId !== user?.id) {
            toast.info("New message received");
          }
        }
        fetchRooms(); // to update last message preview and unread counts
      };

      const handleTyping = ({ senderId, isTyping }) => {
        if (isTyping && senderId !== user?.id) {
          setTypingIndicator('Someone is typing...');
        } else {
          setTypingIndicator('');
        }
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('typing', handleTyping);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('typing', handleTyping);
      };
    }
  }, [socket, activeRoom, user]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRoom = async (room) => {
    setActiveRoom(room);
    if (socket) {
      if (activeRoom) socket.emit('leaveRoom', { roomId: activeRoom.id });
      socket.emit('joinRoom', { roomId: room.id });
    }
    
    try {
      const res = await api.get(`/api/chat/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      scrollToBottom();
      
      // mark as read
      await api.put(`/api/chat/rooms/${room.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    const msgContent = newMessage;
    setNewMessage('');
    
    if (socket) {
      socket.emit('typing', { roomId: activeRoom.id, senderId: user?.id, isTyping: false });
      socket.emit('sendMessage', {
        roomId: activeRoom.id,
        senderId: user?.id,
        content: msgContent,
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && activeRoom) {
      socket.emit('typing', { roomId: activeRoom.id, senderId: user?.id, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { roomId: activeRoom.id, senderId: user?.id, isTyping: false });
      }, 1000);
    }
  };

  const createChat = async () => {
    if (selectedEmployees.length === 0) return;
    try {
      const type = selectedEmployees.length > 1 ? 'GROUP' : 'DIRECT';
      const name = type === 'GROUP' ? 'Group Chat' : '';
      const res = await api.post('/api/chat/rooms', {
        type,
        participantIds: selectedEmployees.map(e => e.userId || e.id),
        name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsNewChatOpen(false);
      setSelectedEmployees([]);
      fetchRooms();
      loadRoom(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async () => {
    if (!taskData.title || !taskData.assigneeId) return;
    try {
      await api.post(`/api/chat/rooms/${activeRoom.id}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsTaskOpen(false);
      setTaskData({ title: '', description: '', assigneeId: '', dueDate: '', priority: 'MEDIUM' });
      toast.success("Task assigned successfully");
      
      // Send a system message via socket if possible, or just let backend handle it
      if (socket) {
        socket.emit('sendMessage', {
          roomId: activeRoom.id,
          senderId: user?.id,
          content: `Task created: ${taskData.title}`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getRoomName = (room) => {
    if (room.name) return room.name;
    const otherParticipant = room.participants?.find(p => p.userId !== user?.id);
    if (!otherParticipant) return 'Unknown Chat';
    const emp = employees.find(e => (e.userId || e.id) === otherParticipant.userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Direct Message';
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-background dark:bg-card border rounded-xl overflow-hidden m-4">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r bg-card dark:bg-slate-950 flex flex-col ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input 
                    placeholder="Search staff..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {(Array.isArray(employees) ? employees : [])
                      .filter(e => e.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || e.lastName?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(emp => (
                      <div key={emp.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300"
                          checked={selectedEmployees.some(se => se.id === emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedEmployees([...selectedEmployees, emp]);
                            else setSelectedEmployees(selectedEmployees.filter(se => se.id !== emp.id));
                          }}
                        />
                        <span>{emp.firstName} {emp.lastName}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" onClick={createChat}>Start Chat</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-9" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.map(room => {
            const lastMsg = room.messages?.[0];
            const isUnread = lastMsg && lastMsg.senderId !== user?.id && !(lastMsg.readBy && lastMsg.readBy.includes(user?.id));
            return (
              <div 
                key={room.id}
                onClick={() => loadRoom(room)}
                className={`p-4 border-b cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${activeRoom?.id === room.id ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      {room.type === 'GROUP' ? <Users className="h-5 w-5 text-muted-foreground" /> : <MessageCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground dark:text-slate-100">{getRoomName(room)}</p>
                      <p className="text-xs text-muted-foreground truncate w-32">
                        {lastMsg ? lastMsg.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {lastMsg && (
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(lastMsg.createdAt)}
                      </span>
                    )}
                    {isUnread && <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeRoom ? (
        <div className={`flex-1 flex flex-col bg-card dark:bg-slate-950 ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="h-16 border-b flex items-center px-4 space-x-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveRoom(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
              {activeRoom.type === 'GROUP' ? <Users className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{getRoomName(activeRoom)}</h3>
              {typingIndicator && <p className="text-xs text-blue-500">{typingIndicator}</p>}
            </div>
            <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Create Task">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task from Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                      value={taskData.title}
                      onChange={e => setTaskData({...taskData, title: e.target.value})}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input 
                      value={taskData.description}
                      onChange={e => setTaskData({...taskData, description: e.target.value})}
                      placeholder="Task description"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignee</label>
                    <select 
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={taskData.assigneeId}
                      onChange={e => setTaskData({...taskData, assigneeId: e.target.value})}
                    >
                      <option value="">Select Assignee...</option>
                      {activeRoom.participants?.map(p => {
                        const emp = employees.find(e => (e.userId || e.id) === p.userId);
                        if (!emp) return null;
                        return (
                          <option key={emp.id} value={emp.userId || emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Due Date</label>
                      <Input 
                        type="date"
                        value={taskData.dueDate}
                        onChange={e => setTaskData({...taskData, dueDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <select 
                        className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={taskData.priority}
                        onChange={e => setTaskData({...taskData, priority: e.target.value})}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={createTask}>Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4 flex flex-col">
              {messages.map((msg, i) => {
                const isSent = msg.senderId === user?.id;
                return (
                  <div key={msg.id || `msg-${i}-${msg.createdAt || Date.now()}`} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isSent 
                        ? 'bg-card text-white rounded-br-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-foreground dark:text-slate-100 rounded-bl-none'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-[10px] opacity-70 mt-1 flex justify-end items-center gap-1">
                        {timeAgo(msg.createdAt)}
                        {isSent && (
                          <span className="ml-1">
                            {(() => {
                              try {
                                const readByArr = typeof msg.readBy === 'string' ? JSON.parse(msg.readBy) : (msg.readBy || []);
                                return readByArr.filter(id => id !== user?.id).length > 0 ? (
                                  <CheckCheck className="w-3 h-3 text-blue-400" />
                                ) : (
                                  <Check className="w-3 h-3 text-slate-400" />
                                );
                              } catch (e) {
                                return <Check className="w-3 h-3 text-slate-400" />;
                              }
                            })()}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-card dark:bg-slate-950">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 bg-background dark:bg-card border-none"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-muted-foreground">
          <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
