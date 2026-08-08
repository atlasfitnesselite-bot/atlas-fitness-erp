import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Placeholder({ title }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is currently under development. Data modules will be connected shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
