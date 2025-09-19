import React, { useState } from "react";
import './TodoManager.css';

// 해당 날짜가 몇 번째 주차인지 반환 : Date객체 -> number
const getWeekNumber = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const adjustedDate = date.getDate() + firstDayWeekday - 1;
  return Math.ceil(adjustedDate / 7);
};

// 시작~종료 날짜 사이의 모든 주차(월 n주차) 목록 반환
const getWeeksInRange = (startDate, endDate) => {
  const weeks = new Set();
  const current = new Date(startDate);
  while (current <= endDate) {
    const weekNum = getWeekNumber(current);
    const monthName = current.toLocaleDateString('ko-KR', { month: 'long' });
    weeks.add(`${monthName} ${weekNum}주차`);
    current.setDate(current.getDate() + 1);
  }
  return Array.from(weeks);
};

// 해당 연/월/주차에 포함되는 날짜(일) 배열 반환
const getDaysInWeek = (year, month, weekNumber) => {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayWeekday = firstDay.getDay();
  const startDate = (weekNumber - 1) * 7 - firstDayWeekday + 1;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = startDate + i;
    if (dayDate > 0) {
      const date = new Date(year, month - 1, dayDate);
      if (date.getMonth() === month - 1) {
        days.push(dayDate);
      }
    }
  }
  return days;
};

// date가 startDate~endDate 사이에 포함되는지 여부
const isDateInRange = (date, startDate, endDate) => {
  return date >= startDate && date <= endDate;
};

// 할 일(투두) 관리 메인 컴포넌트
function TodoManager({ subtask }) {
  // 샘플 데이터 (subtask가 없을 때)
  const sampleSubtask = {
    id: "103",
    title: "프론트엔드 개발", 
    deadline: new Date("2024-10-15"),
    progress: 45,
    priority: "중",
    startDate: "2024-09-20",
    endDate: "2024-10-15",
    description: "React 기반 사용자 인터페이스 구현"
  };

  // subtask가 없으면 샘플 데이터 사용
  const currentSubtask = subtask || sampleSubtask;

  const startDate = new Date(currentSubtask.startDate);
  const endDate = new Date(currentSubtask.endDate);
  const availableWeeks = getWeeksInRange(startDate, endDate);
  
  const [selectedWeek, setSelectedWeek] = useState(availableWeeks[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todos, setTodos] = useState({});
  const [newTodo, setNewTodo] = useState('');

  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    setSelectedDate(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const addTodo = () => {
    if (!newTodo.trim() || !selectedDate) return;
    const dateKey = `${selectedDate}`;
    setTodos(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now(), text: newTodo, progress: 0 }]
    }));
    setNewTodo('');
  };

  const updateTodoProgress = (dateKey, todoId, newProgress) => {
    setTodos(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(todo => 
        todo.id === todoId ? { ...todo, progress: newProgress } : todo
      )
    }));
  };

  const deleteTodo = (dateKey, todoId) => {
    setTodos(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(todo => todo.id !== todoId)
    }));
  };

  const getWeekDays = () => {
    if (!selectedWeek) return [];
    const weekMatch = selectedWeek.match(/(\d+)월 (\d+)주차/);
    if (!weekMatch) return [];
    const month = parseInt(weekMatch[1]);
    const weekNum = parseInt(weekMatch[2]);
    const year = startDate.getFullYear();
    return getDaysInWeek(year, month, weekNum);
  };

  const isDateActive = (day) => {
    const currentMonth = selectedWeek?.match(/(\d+)월/)?.[1];
    if (!currentMonth) return false;
    const checkDate = new Date(startDate.getFullYear(), parseInt(currentMonth) - 1, day);
    return isDateInRange(checkDate, startDate, endDate);
  };

  const currentTodos = selectedDate ? todos[selectedDate] || [] : [];

  // 우선순위별 색상
  const getPriorityColor = (priority) => {
    switch(priority) {
      case '상': return '#dc3545';
      case '중': return '#ffc107';
      case '하': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="todo-bar">
        <div className="todo-container">
      {/* 서브태스크 정보 헤더 */}
      {/* <div className="subtask-info">
        <div className="subtask-header">
          <h2 className="subtask-title">{currentSubtask.title}</h2>
          <div 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(currentSubtask.priority) }}
          >
            {currentSubtask.priority}
          </div>
        </div>
        <p className="subtask-description">{currentSubtask.description}</p>
        <div className="subtask-meta">
          <span>기간: {currentSubtask.startDate} ~ {currentSubtask.endDate}</span>
          <span>진행률: {currentSubtask.progress}%</span>
        </div>
      </div> */}

      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => {
            const currentIndex = availableWeeks.findIndex(week => week === selectedWeek);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : availableWeeks.length - 1;
            handleWeekSelect(availableWeeks[prevIndex]);
          }}
        >
          ‹
        </button>
        <div className="month-year">
          {selectedWeek || availableWeeks[0]}
        </div>
        <button 
          className="nav-btn"
          onClick={() => {
            const currentIndex = availableWeeks.findIndex(week => week === selectedWeek);
            const nextIndex = currentIndex < availableWeeks.length - 1 ? currentIndex + 1 : 0;
            handleWeekSelect(availableWeeks[nextIndex]);
          }}
        >
          ›
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="calendar-days">
        <div>
          {getWeekDays().map(day => (
            <div
              key={day}
              onClick={() => isDateActive(day) ? handleDateSelect(day) : null}
              className={`day ${selectedDate === day ? 'today' : ''} ${!isDateActive(day) ? 'disabled' : ''}`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* 할 일 입력 */}
      {selectedDate && (
        <>
          <div className="task-input">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="할 일을 입력하세요"
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button 
              className="add-task-btn"
              onClick={addTodo}
            >
              <svg width="20" height="20" viewBox="0 0 29 29" fill="white">
                <path d="M14.5 0v29M0 14.5h29" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
          </div>

          {/* 할 일 목록 */}
          <div className="task-list">
            <h3>
              {selectedWeek} {selectedDate}일 할 일
            </h3>
            
            {currentTodos.length === 0 ? (
              <p className="empty-state">
                등록된 할 일이 없습니다.
              </p>
            ) : (
              currentTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`task-item ${todo.progress === 100 ? 'completed' : ''}`}
                >
                  <div 
                    className="progress-bar"
                    onMouseDown={(e) => {
                      const progressBar = e.currentTarget;
                      const rect = progressBar.getBoundingClientRect();
                      const handleMouseMove = (moveEvent) => {
                        const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
                        const percentage = Math.round((x / rect.width) * 100);
                        updateTodoProgress(selectedDate.toString(), todo.id, percentage);
                      };
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                      handleMouseMove(e);
                    }}
                  >
                    <div 
                      className={`progress ${todo.progress === 100 ? 'completed' : ''}`}
                      style={{ width: `${todo.progress}%` }}
                    />
                    <span className="progress-text">
                      {todo.progress}%
                    </span>
                    {/* 드래그 핸들 */}
                    <div 
                      className={`progress-handle ${todo.progress === 100 ? 'completed' : ''}`}
                      style={{ left: `${Math.max(0, Math.min(todo.progress - 1, 99))}%` }}
                    />
                  </div>
                  
                  <span className={`task-title ${todo.progress === 100 ? 'completed' : ''}`}>
                    {todo.text}
                  </span>
                  
                  <button 
                    className="task-options"
                    onClick={() => deleteTodo(selectedDate.toString(), todo.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 날짜 선택 안내 */}
      {!selectedDate && (
        <div className="date-selection-guide">
          <h4>날짜를 선택해주세요</h4>
          <p>
            위에서 날짜를 선택하면<br/>
            해당 날짜의 할 일을 관리할 수 있습니다.
          </p>
        </div>
      )}
    </div>
    </div>
  );
}

export default TodoManager;