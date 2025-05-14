"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
// import { mockHousekeepingTasks } from '@/lib/mockData'; // Using data store
import type { HousekeepingTask, HousekeepingTaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { House, Sparkles, Wrench, User, Clock, Edit3, PlusCircle, ListFilter, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getHousekeepingTasks, updateTaskStatus } from '@/app/actions/housekeepingActions';
import { AddTaskModal } from '@/components/admin/AddTaskModal';

// Placeholder function - you'll need a server action for this
async function fetchHousekeepingTasks(): Promise<HousekeepingTask[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // return mockHousekeepingTasks; // Replace with actual data fetching
  return []; // Start with empty if no action is ready
}

export default function AdminHousekeepingPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      const fetchedTasks = await getHousekeepingTasks();
      setTasks(fetchedTasks);
      setIsLoading(false);
    }
    loadTasks();
  }, []);

  const handleTaskAdded = (newTask: HousekeepingTask) => {
    setTasks(prev => [newTask, ...prev]);
    toast({
      title: "Task Created",
      description: `New housekeeping task has been created for room ${newTask.roomId}`,
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: HousekeepingTaskStatus) => {
    const result = await updateTaskStatus(taskId, newStatus);
    
    if (result.success) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: HousekeepingTaskStatus) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'In Progress': return 'outline';
      case 'Completed': return 'secondary';
      case 'Blocked': return 'destructive';
      default: return 'default';
    }
  };
  
  const getTaskIcon = (taskType: HousekeepingTask['task']) => {
    switch (taskType) {
        case 'Full Clean': return <Sparkles className="h-4 w-4 text-blue-500" />;
        case 'Towel Change': return <Sparkles className="h-4 w-4 text-green-500" />;
        case 'Turndown Service': return <Sparkles className="h-4 w-4 text-purple-500" />;
        case 'Maintenance Check': return <Wrench className="h-4 w-4 text-orange-500" />;
        default: return <Sparkles className="h-4 w-4" />;
    }
  }

  const filteredTasks = tasks.filter(task => filterStatus === "all" || task.status === filterStatus);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <House className="h-6 w-6 text-primary" />
              Housekeeping Management
            </CardTitle>
            <CardDescription>Manage room cleaning schedules, staff assignments, and maintenance requests.</CardDescription>
          </div>
           <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => setIsAddTaskModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading housekeeping tasks...</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room ID</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Last Cleaned</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No housekeeping tasks match the current filter.
                  </TableCell>
                </TableRow>
              )}
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.roomId} <span className="text-xs text-muted-foreground">({task.roomType.replace(/_/g, ' ')})</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        {getTaskIcon(task.task)}
                        {task.task}
                    </div>
                    {task.notes && <div className="text-xs text-muted-foreground truncate max-w-[150px]">{task.notes}</div>}
                  </TableCell>
                  <TableCell>
                    {task.assignedTo ? (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground"/> {task.assignedTo}
                        </div>
                    ): (
                        <span className="text-xs italic text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1" title={task.requestedAt ? formatDistanceToNow(parseISO(task.requestedAt), { addSuffix: true }) : 'N/A'}>
                        <Clock className="h-3 w-3 text-muted-foreground"/> 
                        {task.requestedAt ? formatDistanceToNow(parseISO(task.requestedAt), { addSuffix: true }) : 'N/A'}
                     </div>
                  </TableCell>
                  <TableCell>
                    {task.lastCleaned ? (
                        <div className="flex items-center gap-1" title={formatDistanceToNow(parseISO(task.lastCleaned), { addSuffix: true })}>
                            <Clock className="h-3 w-3 text-muted-foreground"/> 
                           {formatDistanceToNow(parseISO(task.lastCleaned), { addSuffix: true })}
                        </div>
                    ) : (
                        <span className="text-xs italic text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select 
                        defaultValue={task.status} 
                        onValueChange={(value: HousekeepingTaskStatus) => handleStatusChange(task.id, value)}
                    >
                        <SelectTrigger className="w-[130px] h-8 text-xs capitalize bg-transparent border-0 shadow-none focus:ring-0 data-[state=open]:ring-1 data-[state=open]:ring-ring">
                             <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize w-full justify-center px-1 py-0.5">
                                {task.status}
                             </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Edit Task">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}

