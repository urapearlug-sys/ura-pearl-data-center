import React, { useState, useEffect, useCallback } from 'react';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = useCallback(async () => {
    try {
      // TODO: implement real API call
      // const response = await fetch('/api/tasks');
      // const data = await response.json();
      // setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTasks]);

  return (
    <div>
      {/* Placeholder until tasks UI is implemented */}
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks to display.</p>
      ) : (
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>{String(task)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;