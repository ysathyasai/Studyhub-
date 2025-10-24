"use client";

import React, { useState, useEffect } from 'react';
import { Todo } from '@/entities/Todo';
import { Subject } from '@/entities/Subject';
import useAppLevelAuth from '@/hooks/useAppLevelAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckSquare, Trash2, Edit, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function TodoListsPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);

  const [todoData, setTodoData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'personal',
    subjectId: '',
    estimatedTime: 0
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      const [todosData, subjectsData] = await Promise.all([
        Todo.list('createdAt:desc'),
        Subject.list()
      ]);
      setTodos(todosData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!todoData.title) {
      toast({ title: "Title required", description: "Please enter a todo title", variant: "destructive" });
      return;
    }

    try {
      if (editingTodo) {
        await Todo.update(editingTodo.id, todoData);
        toast({ title: "Success", description: "Todo updated successfully" });
      } else {
        await Todo.create(todoData);
        toast({ title: "Success", description: "Todo created successfully" });
      }
      loadData();
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save todo", variant: "destructive" });
    }
  };

  const handleToggleComplete = async (todo: any) => {
    try {
      const updatedData = {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : null
      };
      await Todo.update(todo.id, updatedData);
      setTodos(todos.map(t => t.id === todo.id ? { ...t, ...updatedData } : t));
      toast({ 
        title: "Success", 
        description: `Todo ${!todo.completed ? 'completed' : 'reopened'}` 
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update todo", variant: "destructive" });
    }
  };

  const handleDelete = async (todoId: string) => {
    try {
      await Todo.delete(todoId);
      setTodos(todos.filter(t => t.id !== todoId));
      toast({ title: "Success", description: "Todo deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete todo", variant: "destructive" });
    }
  };

  const handleEdit = (todo: any) => {
    setEditingTodo(todo);
    setTodoData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate || '',
      category: todo.category,
      subjectId: todo.subjectId || '',
      estimatedTime: todo.estimatedTime || 0
    });
    setIsAddingTodo(true);
  };

  const resetForm = () => {
    setTodoData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'personal',
      subjectId: '',
      estimatedTime: 0
    });
    setEditingTodo(null);
    setIsAddingTodo(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed': return todo.completed;
      case 'pending': return !todo.completed;
      case 'overdue': 
        return !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
      default: return true;
    }
  });

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            Todo Lists
          </h1>
          <p className="text-muted-foreground">Organize your tasks and stay productive</p>
        </div>
        <Button onClick={() => setIsAddingTodo(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'completed', 'overdue'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Todo Form */}
        {isAddingTodo && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={todoData.title}
                  onChange={(e) => setTodoData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Todo title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={todoData.description}
                  onChange={(e) => setTodoData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Todo description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={todoData.priority} onValueChange={(value) => setTodoData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={todoData.category} onValueChange={(value) => setTodoData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Subject (optional)</Label>
                <Select value={todoData.subjectId} onValueChange={(value) => setTodoData(prev => ({ ...prev, subjectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={todoData.dueDate}
                    onChange={(e) => setTodoData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Estimated Time (minutes)</Label>
                  <Input
                    type="number"
                    value={todoData.estimatedTime}
                    onChange={(e) => setTodoData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  {editingTodo ? 'Update' : 'Add'} Todo
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Todo List */}
        <div className={`${isAddingTodo ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="space-y-4">
            {filteredTodos.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {filter === 'all' ? 'No todos yet' : `No ${filter} todos`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredTodos.map((todo) => {
                const subject = subjects.find(s => s.id === todo.subjectId);
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
                
                return (
                  <Card key={todo.id} className={`${todo.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleComplete(todo)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-medium ${todo.completed ? 'line-through' : ''}`}>
                              {todo.title}
                            </h3>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority)}`} />
                            <Badge variant="outline" className="text-xs">
                              {todo.category}
                            </Badge>
                            {subject && (
                              <Badge variant="secondary" className="text-xs">
                                {subject.name}
                              </Badge>
                            )}
                          </div>
                          
                          {todo.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {todo.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {todo.dueDate && (
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                              </div>
                            )}
                            {todo.estimatedTime > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {todo.estimatedTime}m
                              </div>
                            )}
                            {todo.completedAt && (
                              <div className="text-green-600">
                                Completed {format(new Date(todo.completedAt), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(todo)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(todo.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{todos.length}</div>
            <div className="text-sm text-muted-foreground">Total Todos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{todos.filter(t => t.completed).length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{todos.filter(t => !t.completed).length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}