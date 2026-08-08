import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getRooms(@Request() req: any) {
    return this.chatService.getRooms(req.user.id);
  }

  @Get('rooms/:roomId/messages')
  getMessages(@Param('roomId') roomId: string, @Request() req: any) {
    return this.chatService.getMessages(roomId, req.user.id);
  }

  @Post('rooms')
  createRoom(@Body() body: { type: string; participantIds: string[]; name?: string }, @Request() req: any) {
    const participantIds = [...new Set([...body.participantIds, req.user.id])];
    return this.chatService.createRoom(body.type || 'DIRECT', participantIds, body.name);
  }

  @Post('rooms/:roomId/messages')
  sendMessage(@Param('roomId') roomId: string, @Body() body: { content: string; type?: string }, @Request() req: any) {
    return this.chatService.sendMessage(roomId, req.user.id, body.content, body.type || 'TEXT');
  }

  @Put('rooms/:roomId/read')
  markAsRead(@Param('roomId') roomId: string, @Request() req: any) {
    return this.chatService.markAsRead(roomId, req.user.id);
  }

  @Post('rooms/:roomId/tasks')
  createTaskFromChat(@Param('roomId') roomId: string, @Body() taskData: any, @Request() req: any) {
    return this.chatService.createTaskFromChat(roomId, req.user.id, taskData);
  }
}
