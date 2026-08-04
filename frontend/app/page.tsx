"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        const data = await res.json();
        if (active) setTasks(data);
      } catch (err) {
        console.error("Failed to load backend task data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTasks();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority, status: "Todo" }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setOpen(false);
        
        const refreshRes = await fetch("http://localhost:5000/api/tasks");
        const freshData = await refreshRes.json();
        setTasks(freshData);
      }
    } catch (err) {
      console.error("Failed to create task record:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

    return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 pb-20 font-sans selection:bg-blue-500/20">
      {/* Decorative colored glow on top of page background */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      <div className="container mx-auto p-6 max-w-5xl space-y-8 pt-12 relative">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/40 dark:shadow-none">
          <div>
            {/* BEAUTY UPDATE: High-end text gradient on Title */}
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              SmartTask Workspace
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 dark:text-zinc-400">
              ⚡ Premium Team Ticketing & Internal Action Control Center
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            {/* BEAUTY UPDATE: Interactive custom pulse/hover button style */}
            <DialogTrigger className="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:opacity-95 h-11 px-6 transition-all duration-200 cursor-pointer scale-100 hover:scale-[1.02] active:scale-[0.98]">
              + Create New Ticket
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                  Create Operational Issue
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Task Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Fix database lookup indexing loop" required className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc" className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Detailed Description</Label>
                  <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide internal parameters for development workflows..." className="min-h-[110px] resize-none rounded-xl border-slate-200 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Urgency Priority</Label>
                  <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                <Button type="submit" className="w-full h-11 mt-4 font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">Publish to Cluster</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

          {/* Main Work Content Card */}
        <Card className="shadow-lg border border-slate-100 bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl shadow-slate-100/60 dark:shadow-none">
          <CardHeader className="border-b border-slate-100 bg-slate-50/30 dark:bg-zinc-900/50 px-8 py-6">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Active Operational Issues</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400 mt-1">Live relational tracking fetched instantly from your local PostgreSQL cluster.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <p className="text-sm font-semibold text-blue-600 animate-pulse tracking-wide">Synchronizing secure relational database tables...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-24 px-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <p className="font-bold text-slate-800 dark:text-zinc-200 text-xl">No active workspace tickets</p>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">Click &quot;+ Create New Ticket&quot; to save your first operational record directly to PostgreSQL.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/80">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="w-[100px] font-bold pl-8 h-12 text-xs uppercase tracking-widest text-slate-400">ID</TableHead>
                      <TableHead className="font-bold h-12 text-xs uppercase tracking-widest text-slate-400">Task Title</TableHead>
                      <TableHead className="font-bold h-12 text-xs uppercase tracking-widest text-slate-400">Description</TableHead>
                      <TableHead className="font-bold h-12 text-xs uppercase tracking-widest text-slate-400 w-[140px]">Priority</TableHead>
                      <TableHead className="font-bold h-12 text-xs uppercase tracking-widest text-slate-400 w-[140px]">Workflow</TableHead>
                      <TableHead className="text-right font-bold pr-8 h-12 text-xs uppercase tracking-widest text-slate-400 w-[110px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      // BEAUTY UPDATE: Added soft background transition changes on row hover
                      <TableRow key={task.id} className="hover:bg-blue-50/20 dark:hover:bg-zinc-800/10 transition-colors border-b border-slate-100 last:border-0 group">
                        <TableCell className="font-mono text-xs font-bold text-blue-500 pl-8 py-5">
                          #{task.id}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800 dark:text-zinc-100 text-sm py-5">
                          {task.title}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm max-w-[240px] truncate py-5 font-medium">
                          {task.description || "—"}
                        </TableCell>
                        <TableCell className="py-5">
                          {/* BEAUTY UPDATE: Vivid priority color badges */}
                          {task.priority === "High" && (
                            <Badge className="bg-rose-50 hover:bg-rose-50 text-rose-600 border border-rose-100 font-semibold rounded-lg shadow-none px-2.5 py-1 text-xs">High</Badge>
                          )}
                          {task.priority === "Medium" && (
                            <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-600 border border-amber-100 font-semibold rounded-lg shadow-none px-2.5 py-1 text-xs">Medium</Badge>
                          )}
                          {task.priority === "Low" && (
                            <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold rounded-lg shadow-none px-2.5 py-1 text-xs">Low</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-5">
                          {/* BEAUTY UPDATE: Sleek blueprint style pipeline status tracking indicator */}
                          <span className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-full px-3 py-1 border border-blue-100 dark:border-blue-900/50 shadow-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-8 py-5">
                          {/* BEAUTY UPDATE: Subtle delete tag layout button popping cleanly on action selections */}
                          <button onClick={() => handleDelete(task.id)} className="text-xs font-bold text-rose-500 hover:text-white bg-transparent hover:bg-rose-500 border border-transparent hover:border-rose-500 rounded-lg px-3 py-1.5 transition-all duration-200 cursor-pointer opacity-80 group-hover:opacity-100">
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
