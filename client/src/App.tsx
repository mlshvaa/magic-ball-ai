import React, { useState, useEffect, useRef } from "react";
import "./style.css";

export default function App() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const answerRef = useRef<HTMLDivElement>(null);

  // волшебная пыль начало
  type Particle = {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
    flicker: boolean;
  }

  useEffect(() => {
    const canvas = document.getElementById("magicDust") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    let particles: Particle[] = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speedY: Math.random() * 0.3 + 0.1,
        speedX: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.6 + 0.4,
        flicker: true,
      };
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        if (p.flicker) {
          p.opacity += (Math.random() - 0.5) * 0.05;
          p.opacity = Math.min(Math.max(p.opacity, 0.2), 0.9);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(144, 101, 233, ${p.opacity})`;
        ctx.shadowColor = "violet";
        ctx.shadowBlur = 15;
        ctx.fill();

        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          Object.assign(p, createParticle());
          p.y = canvas.height + 10;
        }
      });

      requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    particles = Array.from({ length: 200 }, createParticle);
    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  // волшебная пыль конец

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.style.opacity = "0";
      void answerRef.current.offsetWidth;
      answerRef.current.style.opacity = "1";
    }
  }, [answer]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      const response = await fetch("/api/magic/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: question }),
      });

      const data = await response.text();
      setAnswer(data);
    } catch (error) {
      console.error("Ошибка при запросе к магическому шару:", error);
      setAnswer("Упс! Что-то пошло не так.");
    }

    setQuestion("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAsk();
  };

  return (
    <>
      <canvas id="magicDust"></canvas>

      <h1>Спроси магический шар</h1>

      <div className="form">
        <input
          className="placeholder"
          placeholder="Задай свой вопрос..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="ask-button" onClick={handleAsk}>
          Спросить
        </button>
      </div>

      <div className="ball">
        <img src="./img/the_ball.PNG" alt="Магический шар для предсказаний" />
        {answer && (
          <div className="answer" ref={answerRef}>
            {answer}
          </div>
        )}
      </div>
    </>
  );
}
