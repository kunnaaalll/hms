
"use client";

import { Users, BedDouble, IndianRupee, BookOpenCheck } from "lucide-react"; // Removed BarChart, LineChart
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer, Pie, PieChart as RechartsPieChart, Cell, BarChart, LineChart as RechartsLineChart } from "recharts"; // Added BarChart, LineChart (aliased LineChart to avoid conflict if any)


const chartData = [
  { month: "January", bookings: 12, revenue: 240000 }, // Adjusted revenue for Rupee
  { month: "February", bookings: 19, revenue: 380000 },
  { month: "March", bookings: 3, revenue: 120000 },
  { month: "April", bookings: 5, revenue: 450000 },
  { month: "May", bookings: 2, revenue: 100000 },
  { month: "June", bookings: 20, revenue: 800000 },
];

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue (₹)", // Added Rupee symbol
    color: "hsl(var(--chart-2))",
  },
};

const pieChartData = [
  { name: 'Deluxe Queen', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Luxury King Suite', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Standard Twin', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Family Suite', value: 200, fill: 'hsl(var(--chart-4))' },
];


export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, Admin!</h1>
      <p className="text-muted-foreground">Here's an overview of Lavender Luxury Hotel's performance.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4,523,189</div> 
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bookings Overview</CardTitle>
            <CardDescription>Monthly booking trends for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
               <RechartsLineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${value/1000}k`} // Updated to Rupee
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : String(name) ]} />} />
                  <Line
                    dataKey="revenue"
                    type="natural"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Room Type Popularity</CardTitle>
          <CardDescription>Distribution of bookings by room type.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ChartContainer config={{}} className="h-[300px] w-full max-w-xs">
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </RechartsPieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
