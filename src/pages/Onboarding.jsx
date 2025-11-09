import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import catImage from "../assets/images/cat.png";
import footprintIcon from "../assets/images/footprint.svg";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isWaiting, setIsWaiting] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      id: 0,
      question: "(달이가 멀찍이서 지켜본다)\n달이가 집사의 성별을 궁금해 한다.",
      options: ["여자", "남자"],
    },
    {
      id: 1,
      question: "(달이가 관심을 가진다)\n연령을 선택해주세요.",
      options: ["10대", "20대", "30대", "40대 이상"],
    },
    {
      id: 2,
      question: "(달이가 가까이 다가온다)\n당신은…?",
      options: ["학생", "직장인", "기타"],
    },
    {
      id: 3,
      sequence: [
        "(달이가 경계를 풀고 옆에 앉는다.)",
        "나랑 어떤 이야기를 하고 싶어?",
      ],
      input: true,
    },
  ];

  useEffect(() => {
    setMessages([{ type: "question", text: steps[0].question }]);
    setTimeout(() => setIsWaiting(false), 800);
  }, []);

  const handleOptionClick = (option) => {
    if (isWaiting) return;
    setIsWaiting(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "answer", text: option }]);
    }, 400);

    setTimeout(() => {
      const nextStep = step + 1;
      if (nextStep < steps.length) {
        setStep(nextStep);

        if (steps[nextStep].input) {
          setMessages((prev) => [
            ...prev,
            { type: "question", text: steps[nextStep].sequence[0] },
          ]);

          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { type: "question-green", text: steps[nextStep].sequence[1] },
            ]);
          }, 800);

          setTimeout(() => {
            setShowInput(true);
            setIsWaiting(false);
          }, 1600);
        } else {
          setMessages((prev) => [
            ...prev,
            { type: "question", text: steps[nextStep].question },
          ]);
          setTimeout(() => setIsWaiting(false), 800);
        }
      }
    }, 1600);
  };

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { type: "answer", text: inputText }]);
    setInputText("");

    // 로딩 화면 표시
    setTimeout(() => {
      setIsLoading(true);
    }, 500);

    // 3.5초 후 홈으로 이동 (애니메이션 완료 후)
    setTimeout(() => {
      navigate("/home");
    }, 4000);
  };

  const handleSkip = () => {
    navigate("/home");
  };

  const progress = ((step + 1) / steps.length) * 100;

  if (isLoading) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "linear-gradient(to bottom, #2f2f2f 0%, #d9d4c8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* 발자국 애니메이션 */}
      <div style={{ position: "absolute", inset: 0 }}>
        {[...Array(5)].map((_, i) => {
          const baseRight = 10 + i * 14;
          const baseBottom = 5 + i * 16;
          const offsetX = i % 2 === 0 ? -8 : 8;

          return (
            <motion.img
              key={i}
              src={footprintIcon}
              alt="footprint"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: i * 0.25,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                right: `${baseRight + offsetX}%`,
                bottom: `${baseBottom}%`,
                transform: `rotate(${i % 2 === 0 ? "-22deg" : "28deg"})`,
                width: `${38 + i * 1.5}px`,
                height: `${38 + i * 1.5}px`,
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
          );
        })}

        {/* ✨ 마지막 발자국 - 빛나며 사라지는 효과 */}
        <motion.img
          src={footprintIcon}
          alt="footprint-glow"
          initial={{ opacity: 0, scale: 0.8, filter: "brightness(0) invert(1)" }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1.2],
            filter: [
              "brightness(0) invert(1)",
              "brightness(2) invert(1)",
              "brightness(4) invert(1)",
            ],
          }}
          transition={{
            delay: 1.8, // 마지막 발자국보다 늦게 등장
            duration: 1.6,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            right: "82%",
            bottom: "88%",
            transform: "rotate(15deg)",
            width: "44px",
            height: "44px",
            opacity: 0.9,
          }}
        />
      </div>

      {/* ✨ 중앙 텍스트 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: "1.3rem",
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}
        >
          간택 당하는 중...
        </p>
      </motion.div>
    </div>
  );
}





  return (
    <div className="relative w-full h-screen bg-[#fef9f1] flex flex-col overflow-hidden">
      {/* 🟢 상단 진행도 */}
      <div className="w-full flex flex-col items-center pt-[10px] pb-4 bg-[#fef9f1] sticky top-0 z-30">
        {/* ✅ 진행도 바 (80% 중앙) */}
        <div className="relative w-[80%] h-[8px] bg-gray-200 rounded-full mb-2">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#59B464] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <motion.img
            src={footprintIcon}
            alt="progress-footprint"
            className="absolute w-[16px] h-[16px] top-[-4px] z-50 select-none"
            animate={{ left: `calc(${progress}% - 8px)` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* ✅ 진행 단계 텍스트 */}
        <p className="text-sm sm:text-base text-gray-700 font-medium text-center">
          Step {step + 1}/4 - 달이에게 당신을 알려주세요
        </p>
      </div>

      {/* 🐈 고양이 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.img
          src={catImage}
          alt="Black Cat"
          className="w-[144px] sm:w-[180px] object-contain select-none"
          style={{ position: "fixed", top: "50%", left: "50%", zIndex: 0 }}
          initial={{ scale: 0.6, opacity: 0.3, x: "-50%", y: "-50%" }}
          animate={{
            scale: step === 0 ? 0.6 : step === 1 ? 0.8 : step === 2 ? 0.95 : 1.1,
            opacity: step === 0 ? 0.3 : step === 1 ? 0.5 : step === 2 ? 0.75 : 1,
            x: "-50%",
            y: "-50%",
          }}
          transition={{
            duration: 1.0,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* 💬 대화 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 z-10 space-y-4 mt-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{
                opacity: 0,
                y:
                  msg.type === "question" || msg.type === "question-green"
                    ? -10
                    : 10,
                scale: msg.type === "question-green" ? 0.8 : 1,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: msg.type === "question-green" ? 0.45 : 0.35,
                ease: "easeOut",
              }}
              className={`flex ${
                msg.type === "question" || msg.type === "question-green"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div
                className={`${
                  msg.type === "question"
                    ? "bubble-left"
                    : msg.type === "question-green"
                    ? "bubble-left bubble-green-text"
                    : "bubble-right"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ✅ 선택지 버튼 */}
        {!steps[step].input && !isWaiting ? (
          <motion.div
            key={`options-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-end gap-2 mt-3"
          >
            {steps[step].options.map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                onClick={() => handleOptionClick(opt)}
                className="bubble-right cursor-pointer hover:opacity-80 transition-all border-none outline-none"
              >
                {opt}
              </motion.button>
            ))}
          </motion.div>
        ) : null}

        {/* ✅ Step 4 입력창 */}
        {steps[step].input && showInput && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex justify-end items-center gap-1 mt-3"
          >
            <button
              onClick={handleSubmit}
              className="bg-[#7F7F7F] text-white px-4 py-2 rounded-full text-sm h-[40px] flex items-center justify-center hover:opacity-80 transition-all border-none outline-none"
            >
              전송
            </button>
            <div
              className="relative flex items-center"
              style={{ transform: "translateX(5px)" }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="이야기를 입력해주세요."
                className="bubble-right w-[150px] sm:w-[200px] bg-[#7F7F7F] border-none outline-none custom-input"
              />
              <div
                className="absolute right-[18px] top-1/2 -translate-y-1/4
                   w-0 h-0 border-t-[6px] border-t-transparent 
                   border-b-[6px] border-b-transparent 
                   border-l-[13px] border-l-[#7F7F7F]"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* 하단 */}
      <div className="w-full text-center py-[15px] bg-[#fef9f1]">
        <button onClick={handleSkip} className="text-gray-700 text-sm sm:text-base hover:text-black transition-colors bg-transparent border-none outline-none">
          건너뛰기
        </button>
      </div>

      {/* 💬 스타일 */}
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        * {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          background: #fef9f1;
        }
        .bubble-left {
          position: relative;
          display: inline-block;
          background: #000;
          color: white;
          padding: 10px 14px;
          border-radius: 37px;
          font-size: 14px;
          line-height: 1.5;
          word-break: keep-all;
          max-width: 70%;
          margin-left: 12px;
          margin-bottom: 10px;
          white-space: pre-line;
        }
        .bubble-left::after {
          content: '';
          position: absolute;
          border-style: solid;
          border-width: 6px 13px 6px 0;
          border-color: transparent #000;
          left: -9px;
          top: 50%;
          transform: translateY(-50%);
        }
        .bubble-green-text {
          color: #4FA958;
          margin-top: 6px;
        }
        .bubble-right {
          position: relative;
          display: inline-block;
          background: #7F7F7F;
          color: white;
          padding: 10px 14px;
          border-radius: 37px;
          font-size: 14px;
          line-height: 1.5;
          word-break: keep-all;
          max-width: 70%;
          margin-right: 12px;
        }
        .bubble-right::after {
          content: '';
          position: absolute;
          border-style: solid;
          border-width: 6px 0 6px 13px;
          border-color: transparent #7F7F7F;
          right: -9px;
          top: 50%;
          transform: translateY(-50%);
        }
        .custom-input {
          color: #fff !important;
          caret-color: #fff !important;
          font-size: 14px;
          padding: 10px 16px;
          border-radius: 37px;
          line-height: 1.4;
        }
        .custom-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
