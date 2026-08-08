import api from '../../lib/api';
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, ChevronRight, ChevronDown, Award } from "lucide-react"

export default function OrgStructure() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const token = localStorage.getItem("token") || ""

  const fetchStructure = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/employees/org-structure")
      const data = res.data
      if (res.data) {
        setNodes(data || [])
      }
    } catch (err) {
      console.error("Error fetching org structure:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStructure()
  }, [])

  // Build tree from flat lists
  const buildTree = (list) => {
    const map = {}
    const roots = []

    list.forEach((node) => {
      map[node.id] = { ...node, children: [] }
    })

    list.forEach((node) => {
      if (node.managerId && map[node.managerId]) {
        map[node.managerId].children.push(map[node.id])
      } else {
        roots.push(map[node.id])
      }
    })

    return roots
  }

  const orgTree = buildTree(nodes)

  // TreeNode component
  const TreeNode = ({ node }) => {
    const [collapsed, setCollapsed] = useState(false)
    const hasChildren = node.children && node.children.length > 0

    // Highlight search match
    const isMatched = search
      ? `${node.firstName} ${node.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (node.designation?.name || node.designation)?.toLowerCase().includes(search.toLowerCase())
      : false

    return (
      <div className="flex flex-col items-start pl-6 border-l border-border mt-4 relative">
        <div className="absolute top-5 left-0 w-6 h-[1px] bg-slate-200" />
        
        <div className={`flex items-center gap-4 p-3 rounded-lg border w-72 max-w-sm transition-all ${
          isMatched ? "border-red-500 bg-red-50/50 shadow-md ring-1 ring-red-500" : "border-border bg-card hover:border-slate-300"
        }`}>
          {/* Avatar Icon */}
          <div className="h-10 w-10 rounded-full bg-slate-100 border flex items-center justify-center font-semibold text-foreground">
            {node.firstName[0]}{node.lastName[0]}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {node.firstName} {node.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Award className="h-3 w-3 text-red-500" /> {node.designation?.name || node.designation || "No Designation"}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {node.employeeId}
            </p>
          </div>

          {hasChildren && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="h-6 w-6 rounded-md hover:bg-background flex items-center justify-center text-muted-foreground"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>

        {hasChildren && !collapsed && (
          <div className="flex flex-col gap-2 w-full">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization Chart</h1>
        <p className="text-muted-foreground">Interactive reporting line structure and hierarchy.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Interactive Hierarchy Tree</CardTitle>
            <CardDescription>Navigate management nodes and team configurations.</CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto min-h-[500px]">
          {loading ? (
            <div className="space-y-4 max-w-sm">
              <div className="h-12 w-72 bg-slate-100 animate-pulse rounded" />
              <div className="h-12 w-72 bg-slate-100 animate-pulse rounded pl-6" />
              <div className="h-12 w-72 bg-slate-100 animate-pulse rounded pl-12" />
            </div>
          ) : orgTree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto text-foreground mb-3" />
              <p className="text-base font-semibold">No structure found</p>
              <p className="text-sm">Assign employee reporting managers to view structure mapping.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orgTree.map((root) => (
                <div key={root.id} className="border-t first:border-0 pt-4 first:pt-0">
                  <TreeNode node={root} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
