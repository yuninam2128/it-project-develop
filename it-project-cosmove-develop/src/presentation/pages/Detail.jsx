import React, { useState, useEffect, use } from "react";
import { useParams } from "react-router-dom";
import SubtaskMindmap from "../components/subtask/SubtaskMindmap";
import SubtaskForm from "../components/subtask/SubtaskForm";
// import TodoManager from "../components/todo/TodoManager";
import "./Detail.css";
import Header from "../components/header/header";
import TodoManager from "../components/todo/TodoManager";

// 더미 데이터 (실제로는 Firebase에서 가져올 데이터)
const getDummyProjectData = (projectId) => ({
  id: projectId,
  title: "웹사이트 개발 프로젝트",
  deadline: new Date("2024-12-31"),
  progress: 65,
  priority: "상",
  description: "회사 홈페이지 리뉴얼 프로젝트",
  subtasks: [
    {
      id: "101",
      title: "기획 정리",
      deadline: new Date("2024-09-15"),
      progress: 100,
      priority: "상",
      startDate: "2024-09-05",
      endDate: "2024-09-15",
      description: "요구사항 분석 및 기획서 작성"
    },
    {
      id: "102", 
      title: "UI 디자인",
      deadline: new Date("2024-09-25"),
      progress: 80,
      priority: "상",
      startDate: "2024-09-10",
      endDate: "2024-09-25",
      description: "화면 설계 및 디자인 시안 제작"
    },
    {
      id: "103",
      title: "프론트엔드 개발", 
      deadline: new Date("2024-10-15"),
      progress: 45,
      priority: "중",
      startDate: "2024-09-20",
      endDate: "2024-10-15",
      description: "React 기반 사용자 인터페이스 구현"
    },
    {
      id: "104",
      title: "백엔드 개발",
      deadline: new Date("2024-10-20"),
      progress: 30,
      priority: "중", 
      startDate: "2024-09-25",
      endDate: "2024-10-20",
      description: "API 서버 및 데이터베이스 구축"
    },
    {
      id: "105",
      title: "테스트 & 배포",
      deadline: new Date("2024-11-01"),
      progress: 0,
      priority: "하",
      startDate: "2024-10-15",
      endDate: "2024-11-01", 
      description: "QA 테스트 및 프로덕션 배포"
    }
  ]
});


function ProjectDetail() {
    const {projectId} = useParams();
    // const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [currentView, setCurrentView] = useState("mindmap");
    const [selectedSubtask, setSelectedSubtask] = useState(null);
    const [subtaskPositions, setSubtaskPositions] = useState({});
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 }); // 동적 크기 반응
    const [showAddForm, setShowAddForm] = useState(false);

    //데이터 받아오기
    useEffect(() => {
        const projectData = getDummyProjectData(projectId);
        setProject(projectData);
        const initialPositions = generateInitialPositions(projectData.subtasks, canvasSize);
        setSubtaskPositions(initialPositions);
    }, [projectId, canvasSize]);

    //중요도에 따른 원 크기 
    const getRadius = (priority) => {
        if (priority === "상") return 75;
        if (priority === "중") return 55;
        return 40;
    };

    //초기 위치
    const generateInitialPositions = (subtasks, size) => {
        const positions = {};
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        const radius = Math.min(size.width, size.height) / 3;

        subtasks.forEach((subtask, index) => {
        const angle = (index * 2 * Math.PI) / subtasks.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const nodeRadius = getRadius(subtask.priority);

        positions[subtask.id] = {
            x: Math.max(nodeRadius, Math.min(x, size.width - nodeRadius)),
            y: Math.max(nodeRadius, Math.min(y, size.height - nodeRadius)),
            radius: nodeRadius
        };
        });

        return positions;
    };

    //새 위치
    const findAvailablePosition = () => {
        const radius = getRadius("중");
        const padding = 20;
        const maxAttempts = 100;

        for (let i = 0; i < maxAttempts; i++) {
        const x = radius + Math.random() * (canvasSize.width - 2 * radius);
        const y = radius + Math.random() * (canvasSize.height - 2 * radius);

        const isOverlapping = Object.values(subtaskPositions).some(pos => {
            const dx = pos.x - x;
            const dy = pos.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < pos.radius + radius + padding;
        });

        if (!isOverlapping) return { x, y, radius };
        }

        return { x: canvasSize.width / 2, y: canvasSize.height / 2, radius };
    };

    //세부 프로젝트 추가 
    const handleAddSubtask = (newSubtask) => {
        if (!project) return;
        const subtaskId = `subtask_${Date.now()}`;
        const subtaskWithId = {
        ...newSubtask,
        id: subtaskId,
        deadline: new Date(newSubtask.deadline),
        progress: Number(newSubtask.progress)
        };
        const newPosition = findAvailablePosition();
        setProject(prev => ({ ...prev, subtasks: [...prev.subtasks, subtaskWithId] }));
        setSubtaskPositions(prev => ({ ...prev, [subtaskId]: newPosition }));
    };

    //세부 프로젝트 수정
    const handleEditSubtask = (updatedSubtask) => {
        if (!project) return;
        setProject(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(subtask =>
            subtask.id === updatedSubtask.id
            ? { ...updatedSubtask, deadline: new Date(updatedSubtask.deadline), progress: Number(updatedSubtask.progress) }
            : subtask
        )
        }));
        const newRadius = getRadius(updatedSubtask.priority);
        setSubtaskPositions(prev => ({ ...prev, [updatedSubtask.id]: { ...prev[updatedSubtask.id], radius: newRadius } }));
    };

    //세부 프로젝트 삭제 
    const handleDeleteSubtask = (subtaskId) => {
        if (!project) return;
        setProject(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== subtaskId) }));
        setSubtaskPositions(prev => {
        const newPos = { ...prev };
        delete newPos[subtaskId];
        return newPos;
        });
    };

    //위치 바뀜 감지 및 업데이트 
    const handleSubtaskPositionChange = (subtaskId, x, y) => {
        setSubtaskPositions(prev => ({
            ...prev,
            [subtaskId]: {
                ...prev[subtaskId],
                x, 
                y,
            }
        }));
    };

    //클릭 감지
    const handleSubtaskClick = (subtask) => {
        setSelectedSubtask(subtask);
        console.log("click!");
        // setCurrentView("todo");
    };

    //뒤로 가기 버튼
    const handleBackToMindmap = () => {
        setCurrentView("mindmap");
        setSelectedSubtask(null);
    };

    //추가 버튼 관리 
    const handleAddClick = () => {
        setShowAddForm(true);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
    };

    if (!project) {
        return <div className="loading-container"><p>프로젝트를 불러오는 중...</p></div>;
    }


  return (
    <div className="App">
    <div className="body-detail">
        <div className="container-detail">
            {/* 이 부분을 '지우고' sidebar컴포넌트를 넣는다. */}
            {/* 단, sidebar 컴포넌트 전체를 감싼 div태그 className은 무조건 sidebar로 할 것 */}
            <aside className="sidebar-detail">
            </aside>

            <div className="main-wrapper-detail">
                <Header onAddClick={handleAddClick}/>    
                <article className="main-article-detail">
                        <div className="date-detail">2025년 09월 10일</div>
                        <div className="title-detail">
                            <span className="highlight-detail">과탑되기</span>의 행성들을 정복해보아요!
                        </div>
                </article>
                <main className="content-area-detail">
                    <SubtaskMindmap
                        project ={project}
                        positions={subtaskPositions}
                        onSubtaskClick={handleSubtaskClick}
                        onAddSubtask={handleEditSubtask}
                        onDeleteSubtask={{handleDeleteSubtask}}
                        onPositionChange={handleSubtaskPositionChange}
                        onCanvasResize={(w,h)=> setCanvasSize({width:w, height:h})}
                    />
                    <TodoManager
                        subtask={null}
                    />
                    {/* <section className="main-content"></section> */}
                    {/* <section className="todo-bar"></section> */}
                </main>

                {/* 마찬가지로 이 부분을 '지우고' 타임라인 컴포넌트를 넣는다. */}
                {/* 단, timeline 컴포넌트 전체를 감싼 div태그 className은 무조건 timeline로 할 것 */}
                <footer className="timeline-detail">
                    2024.06.20
                </footer>
                {showAddForm && (
                    <SubtaskForm
                    onSubmit={(newSubtask) => {
                        handleAddSubtask(newSubtask);
                        setShowAddForm(false);
                    }}
                    onClose={handleFormClose}
                    />

                )}
            </div>
        </div>
    </div>
    </div>
  );
}

export default ProjectDetail;
