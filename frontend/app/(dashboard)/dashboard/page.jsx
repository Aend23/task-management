'use client';
import React,{useState, useEffect, useCallback, useMemo} from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

function Dashboard() {
    const router = useRouter();
    const [tasks, setTasks] = useState({ pending: [], processing: [], completed: [] });
    const [user, setUser] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [viewingTask, setViewingTask] = useState(null);

    useEffect(() => {
        fetchUser();
        fetchTasks();
    }, [router]);

    const fetchUser = async () => {
        try {
            const res = await api.get('/api/user');
            setUser(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                router.push('/login');
            }
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await api.get('/api/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };




    
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        try {
            await api.post('/api/tasks', { title: taskTitle });
            setTaskTitle('');
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error creating task');
        }
    };




    const handleDeleteTask = async (taskId) => {

        try {
            await api.delete('/api/tasks', { data: { taskId } });
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error deleting task');
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await api.put('/api/tasks', { taskId, status: newStatus });
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error updating task');
        }
    };

    const handleStartEdit = useCallback((task) => {
        setEditingTask(String(task._id));
        setEditTitle(task.title);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingTask(null);
        setEditTitle('');
    }, []);

    const handleSaveEdit = useCallback(async (taskId) => {
        if (!editTitle.trim()) return;

        try {
            await api.put('/api/tasks', { taskId: String(taskId), title: editTitle });
            setEditingTask(null);
            setEditTitle('');
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error updating task');
        }
    }, [editTitle]);

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout');
            router.push('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const handleViewTask = (task) => {
        setViewingTask(task);
    };

    const handleCloseView = () => {
        setViewingTask(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'text-yellow-600 bg-yellow-50';
            case 'Processing': return 'text-blue-600 bg-blue-50';
            case 'Completed': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleEditTitleChange = useCallback((value) => {
        setEditTitle(value);
    }, []);

    const TaskCard = React.memo(function TaskCard({ task, editingTask, editTitle, onEditTitleChange, onStartEdit, onCancelEdit, onSaveEdit, onViewTask, onDeleteTask, onUpdateStatus, formatDate }) {
        const isEditing = editingTask === String(task._id);
        const taskId = String(task._id);

        return (
            <div className='bg-white border rounded p-3 sm:p-4 flex flex-col gap-2'>
                {isEditing ? (
                    <div className='flex flex-col sm:flex-row gap-2'>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => onEditTitleChange(e.target.value)}
                            autoFocus
                            className='border p-1.5 sm:p-2 flex-1 rounded text-sm sm:text-base'
                        />
                        <div className='flex gap-2'>
                            <button onClick={() => onSaveEdit(taskId)} className='bg-green-500 text-white px-3 py-1.5 rounded text-sm flex-1 sm:flex-none'>Save</button>
                            <button onClick={onCancelEdit} className='bg-gray-500 text-white px-3 py-1.5 rounded text-sm flex-1 sm:flex-none'>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className='font-medium text-sm sm:text-base break-words'>{task.title}</div>
                        <div className='text-xs text-gray-500'>Created: {formatDate(task.createdAt)}</div>
                        <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                            <div className='flex gap-2 flex-wrap'>
                                <button onClick={() => onViewTask(task)} className='bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex-1 sm:flex-none min-w-[60px]'>View</button>
                                <button onClick={() => onStartEdit(task)} className='bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex-1 sm:flex-none min-w-[60px]'>Edit</button>
                                <button onClick={() => onDeleteTask(task._id)} className='bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm flex-1 sm:flex-none min-w-[60px]'>Delete</button>
                            </div>
                            <select
                                value={task.status}
                                onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                                className='border rounded px-2 py-1 text-xs sm:text-sm flex-1 sm:flex-none'
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
        );
    });

    if (loading) {
        return <div className='flex items-center justify-center h-screen'>Loading...</div>;
    }

    return (
        <div className='min-h-screen bg-zinc-50 p-4 sm:p-6 md:p-8'>
            <div className='max-w-6xl mx-auto'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
                    <h1 className='text-2xl sm:text-3xl font-bold'>Task Management</h1>
                    <div className='flex items-center gap-3 sm:gap-4'>
                        {user && <span className='text-xs sm:text-sm truncate'>Welcome, {user.name}</span>}
                        <button onClick={handleLogout} className='bg-red-500 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base whitespace-nowrap'>Logout</button>
                    </div>
                </div>

                <form onSubmit={handleCreateTask} className='bg-white border rounded p-3 sm:p-4 mb-6'>
                    <div className='flex flex-col sm:flex-row gap-2'>
                        <input
                            type="text"
                            placeholder='Enter task title'
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className='border rounded p-2 flex-1 text-sm sm:text-base'
                        />
                        <button type='submit' className='bg-blue-500 text-white px-4 sm:px-6 py-2 rounded text-sm sm:text-base whitespace-nowrap'>Create Task</button>
                    </div>
                </form>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div>
                        <h2 className='text-lg sm:text-xl font-semibold mb-3 text-yellow-600'>Pending</h2>
                        <div className='flex flex-col gap-3'>
                            {tasks.pending?.length > 0 ? (
                                tasks.pending.map((task) => (
                                    <TaskCard 
                                        key={task._id} 
                                        task={task}
                                        editingTask={editingTask}
                                        editTitle={editTitle}
                                        onEditTitleChange={handleEditTitleChange}
                                        onStartEdit={handleStartEdit}
                                        onCancelEdit={handleCancelEdit}
                                        onSaveEdit={handleSaveEdit}
                                        onViewTask={handleViewTask}
                                        onDeleteTask={handleDeleteTask}
                                        onUpdateStatus={handleUpdateStatus}
                                        formatDate={formatDate}
                                    />
                                ))
                            ) : (
                                <div className='text-gray-400 text-sm'>No pending tasks</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className='text-lg sm:text-xl font-semibold mb-3 text-blue-600'>Processing</h2>
                        <div className='flex flex-col gap-3'>
                            {tasks.processing?.length > 0 ? (
                                tasks.processing.map((task) => (
                                    <TaskCard 
                                        key={task._id} 
                                        task={task}
                                        editingTask={editingTask}
                                        editTitle={editTitle}
                                        onEditTitleChange={handleEditTitleChange}
                                        onStartEdit={handleStartEdit}
                                        onCancelEdit={handleCancelEdit}
                                        onSaveEdit={handleSaveEdit}
                                        onViewTask={handleViewTask}
                                        onDeleteTask={handleDeleteTask}
                                        onUpdateStatus={handleUpdateStatus}
                                        formatDate={formatDate}
                                    />
                                ))
                            ) : (
                                <div className='text-gray-400 text-sm'>No processing tasks</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className='text-lg sm:text-xl font-semibold mb-3 text-green-600'>Completed</h2>
                        <div className='flex flex-col gap-3'>
                            {tasks.completed?.length > 0 ? (
                                tasks.completed.map((task) => (
                                    <TaskCard 
                                        key={task._id} 
                                        task={task}
                                        editingTask={editingTask}
                                        editTitle={editTitle}
                                        onEditTitleChange={handleEditTitleChange}
                                        onStartEdit={handleStartEdit}
                                        onCancelEdit={handleCancelEdit}
                                        onSaveEdit={handleSaveEdit}
                                        onViewTask={handleViewTask}
                                        onDeleteTask={handleDeleteTask}
                                        onUpdateStatus={handleUpdateStatus}
                                        formatDate={formatDate}
                                    />
                                ))
                            ) : (
                                <div className='text-gray-400 text-sm'>No completed tasks</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {viewingTask && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' onClick={handleCloseView}>
                    <div className='bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl sm:text-2xl font-bold'>Task Details</h2>
                            <button onClick={handleCloseView} className='text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none'>&times;</button>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <label className='text-sm font-semibold text-gray-600 block mb-1'>Title</label>
                                <div className='text-base sm:text-lg font-medium text-gray-900 break-words'>{viewingTask.title}</div>
                            </div>

                            <div>
                                <label className='text-sm font-semibold text-gray-600 block mb-1'>Status</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(viewingTask.status)}`}>
                                    {viewingTask.status}
                                </span>
                            </div>

                            <div>
                                <label className='text-sm font-semibold text-gray-600 block mb-1'>Created Date</label>
                                <div className='text-sm sm:text-base text-gray-900 break-words'>{formatFullDate(viewingTask.createdAt)}</div>
                            </div>
                        </div>

                        <div className='mt-6 flex flex-col sm:flex-row gap-2'>
                            <button 
                                onClick={() => {
                                    handleStartEdit(viewingTask);
                                    handleCloseView();
                                }} 
                                className='bg-yellow-500 text-white px-4 py-2 rounded flex-1 text-sm sm:text-base'
                            >
                                Edit Task
                            </button>
                            <button 
                                onClick={handleCloseView} 
                                className='bg-gray-500 text-white px-4 py-2 rounded flex-1 text-sm sm:text-base'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard
