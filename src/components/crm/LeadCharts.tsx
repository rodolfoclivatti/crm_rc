import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface LeadChartsProps {
  data: any[];
}

export const LeadCharts = ({ data }: LeadChartsProps) => {
  // Processar dados para o gráfico de barras (Status)
  const statusCounts = data.reduce((acc: any, curr: any) => {
    const status = curr.STATUS || 'PENDENTE';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(statusCounts).map(key => ({
    name: key,
    total: statusCounts[key]
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#64748b'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Engajamento do Funil</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={barData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="total"
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};