import React, { useState } from "react";
import EditSubtaskForm from "./EditSubtaskForm";

function SubtaskNode({ node, mapOffset, onMove, onClick, onEdit, onDelete }) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // 중요도에 따른 색상 반환
  const getPriorityColor = (priority, isCenter) => {
    if (isCenter) return '#e24a6f';
    
    switch (priority) {
      case '상': return '#dc3545'; // 빨간색
      case '중': return '#4a90e2'; // 파란색
      case '하': return '#28a745'; // 초록색
      default: return '#6c757d'; // 회색
    }
  };

  // 진행도에 따른 테두리 스타일
  const getProgressStyle = (progress) => {
    if (progress === 100) {
      return {
        border: '3px solid #28a745',
        boxShadow: '0 0 10px rgba(40, 167, 69, 0.3)'
      };
    } else if (progress >= 50) {
      return {
        border: '3px solid #ffc107',
        boxShadow: '0 0 10px rgba(255, 193, 7, 0.3)'
      };
    }
    return {};
  };

  const onMouseDown = (e) => {
    setDragging(true);
    setHasMoved(false);
    setOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    setDragStartPos({
      x: e.clientX,
      y: e.clientY,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  //드래그 중
  const onMouseMove = (e) => {
    if (dragging) {
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      if (moveDistance > 5) {
        setHasMoved(true);
        onMove(node.id, e.clientX - offset.x, e.clientY - offset.y);
      }
    }
  };

  // 드래그 종료 
  const onMouseUp = (e) => {
    setDragging(false);
    
    if (!hasMoved) {
      onClick();
    }
    
    setHasMoved(false);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 전역 마우스 이벤트 처리
  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (dragging) {
        onMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (dragging) {
        onMouseUp(e);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragging, hasMoved, offset]);

  // 노드 크기 계산 (반지름 기반)
  const nodeSize = node.radius ? node.radius * 2 : (node.isCenter ? 120 : 80);
  const borderRadius = nodeSize / 2;

  return (
    <>
      <div
        className="subtask-wrapper"
        style={{
          position: 'absolute',
          left: (node.x + (mapOffset?.x || 0)) - nodeSize / 2,
          top: (node.y + (mapOffset?.y || 0)) - nodeSize / 2,
          zIndex: dragging ? 1000 : 1,
          padding: '20px',
          margin: '-20px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`subtask-node ${node.isCenter ? 'center' : ''}`}
          style={{
            width: nodeSize,
            height: nodeSize,
            backgroundColor: getPriorityColor(node.priority, node.isCenter),
            borderRadius: borderRadius,
            cursor: dragging && hasMoved ? 'grabbing' : 'grab',
            transition: dragging ? 'none' : 'all 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: node.isCenter ? '14px' : '12px',
            fontWeight: 'bold',
            textAlign: 'center',
            userSelect: 'none',
            ...getProgressStyle(node.progress)
          }}
          onClick={handleClick}
          onMouseDown={onMouseDown}
        >
          <div style={{ padding: '5px' }}>
            <div>{node.label}</div>
            {!node.isCenter && (
              <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.9 }}>
                {node.progress}%
              </div>
            )}
          </div>
        </div>

        {/* 호버 시 수정/삭제 버튼 (중심 노드 제외) */}
        {!node.isCenter && isHovered && (
          <div
            className="subtask-node-buttons"
            style={{
              position: 'absolute',
              top: '50%',
              left: '100%',
              transform: 'translateY(-50%)',
              marginLeft: '-20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              zIndex: 9999
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditForm(true);
              }}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#AFB8FF',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s, transform 0.2s'
              }}
              title="수정"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('이 세부 작업을 삭제하시겠습니까?')) {
                  onDelete();
                }
              }}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#AFB8FF',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s, transform 0.2s'
              }}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* 수정 폼 모달 */}
      {showEditForm && (
        <EditSubtaskForm
          subtask={node.data}
          onSubmit={(updatedSubtask) => {
            onEdit(updatedSubtask);
            setShowEditForm(false);
          }}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
}

export default SubtaskNode;