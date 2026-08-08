import { useEffect, useState } from "react"
import {
  Search,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Users,
  Building,
  Award,
  ShieldCheck,
  GitMerge,
  Calendar,
  Smartphone,
  Clock,
  FileText,
  Dumbbell,
  CheckCircle2,
  FileDigit,
  Receipt
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useAuthStore } from "@/store/useAuthStore"
import { useDebounce } from "@/hooks/useDebounce"
import api from '../lib/api';
import { Badge } from "./ui/badge"

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const debouncedQuery = useDebounce(query, 300)
  
  const navigate = useNavigate()
  const { logout, hasRole, token } = useAuthStore()

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null)
      return
    }

    const searchApi = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setResults(res.data)
      } catch (error) {
        console.error("Search failed", error)
      } finally {
        setLoading(false)
      }
    }

    searchApi()
  }, [debouncedQuery, token])

  const runCommand = (command) => {
    setOpen(false)
    command()
  }

  // Filter static pages based on search if no query, or match
  const showStatic = !debouncedQuery;
  const isManager = hasRole('OWNER') || hasRole('MANAGER') || hasRole('ADMIN');

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search members, tasks, equipment, or pages..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && <div className="p-4 text-sm text-center text-muted-foreground">Searching...</div>}
        
        {!loading && results && Object.values(results).every(arr => arr.length === 0) && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {/* Dynamic Results */}
        {results?.members?.length > 0 && (
          <CommandGroup heading="Members & PT Clients">
            {results.members.map(member => (
              <CommandItem key={member.id} onSelect={() => runCommand(() => navigate(`/members/${member.id}`))}>
                <User className="mr-2 h-4 w-4 text-blue-500" />
                <div className="flex flex-col">
                  <span>{member.firstName} {member.lastName}</span>
                  <span className="text-xs text-muted-foreground">{member.email || member.phone}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.employees?.length > 0 && (
          <CommandGroup heading="Employees">
            {results.employees.map(emp => (
              <CommandItem key={emp.id} onSelect={() => runCommand(() => navigate(`/employees/${emp.id}`))}>
                <Users className="mr-2 h-4 w-4 text-emerald-500" />
                <div className="flex flex-col">
                  <span>{emp.firstName} {emp.lastName}</span>
                  <span className="text-xs text-muted-foreground">{emp.email || emp.phone}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.equipment?.length > 0 && (
          <CommandGroup heading="Equipment">
            {results.equipment.map(eq => (
              <CommandItem key={eq.id} onSelect={() => runCommand(() => navigate('/equipment'))}>
                <Dumbbell className="mr-2 h-4 w-4 text-orange-500" />
                <div className="flex justify-between w-full items-center">
                  <span>{eq.name}</span>
                  <Badge variant="outline" className="text-[10px]">{eq.category}</Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.tasks?.length > 0 && (
          <CommandGroup heading="Tasks">
            {results.tasks.map(task => (
              <CommandItem key={task.id} onSelect={() => runCommand(() => navigate(isManager ? '/tasks' : '/my-tasks'))}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-purple-500" />
                <span>{task.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.documents?.length > 0 && (
          <CommandGroup heading="Documents">
            {results.documents.map(doc => (
              <CommandItem key={doc.id} onSelect={() => runCommand(() => navigate('/documents'))}>
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex justify-between w-full items-center">
                  <span>{doc.title}</span>
                  <Badge variant="secondary" className="text-[10px]">{doc.docType}</Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.invoices?.length > 0 && (
          <CommandGroup heading="Invoices">
            {results.invoices.map(inv => (
              <CommandItem key={inv.id} onSelect={() => runCommand(() => navigate('/billing'))}>
                <Receipt className="mr-2 h-4 w-4 text-rose-500" />
                <div className="flex justify-between w-full items-center">
                  <span>{inv.transactionReference || 'Invoice'} - {inv.member?.firstName} {inv.member?.lastName}</span>
                  <span className="text-xs font-semibold">₹{inv.amount}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Static Pages fallback */}
        {showStatic && (
          <>
            <CommandGroup heading="Quick Links">
              <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/documents'))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document Center</span>
              </CommandItem>
              {isManager && (
                <>
                  <CommandItem onSelect={() => runCommand(() => navigate('/reports'))}>
                    <FileDigit className="mr-2 h-4 w-4" />
                    <span>Reports & Analytics</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate('/attendance'))}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Attendance Dashboard</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate('/equipment'))}>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    <span>Equipment Management</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => runCommand(() => logout())}
                className="text-red-600 data-[selected=true]:text-red-600 data-[selected=true]:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
