import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Meter from "../components/Meter";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
  outline: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Instructions = styled.div`
  margin-top: 1.25rem;
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.625rem 1.25rem;
  color: black;
  border: none;
  border-radius: 4rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  width: 16rem;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.1);
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: black;
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }
`;

function Visualizer() {
  const presetValues = [0, 15, 25, 80, 100];
  const [currentPresetIndex, setCurrentPresetIndex] = useState(2);
  const [probability, setProbability] = useState(25);
  const [showNeedle, setShowNeedle] = useState(true);
  const [useColorGradient, setUseColorGradient] = useState(false);
  const [isPresetAnimating, setIsPresetAnimating] = useState(false);

  const cyclePreset = () => {
    const nextIndex = (currentPresetIndex + 1) % presetValues.length;
    setCurrentPresetIndex(nextIndex);
    setProbability(presetValues[nextIndex]);
    setIsPresetAnimating(true);

    // Reset preset animation flag after animation completes
    setTimeout(() => {
      setIsPresetAnimating(false);
    }, 1000); // Adjust timing based on animation duration
  };

  useEffect(() => {
    const keysPressed = { left: false, right: false };
    let animationFrame = null;

    const animate = () => {
      if (keysPressed.left) {
        setProbability((prev) => Math.max(0, prev - 0.3));
      }
      if (keysPressed.right) {
        setProbability((prev) => Math.min(100, prev + 0.3));
      }

      if (keysPressed.left || keysPressed.right) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && !keysPressed.left) {
        e.preventDefault();
        keysPressed.left = true;
        if (!animationFrame) {
          animate();
        }
      } else if (e.key === "ArrowRight" && !keysPressed.right) {
        e.preventDefault();
        keysPressed.right = true;
        if (!animationFrame) {
          animate();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft") {
        keysPressed.left = false;
      } else if (e.key === "ArrowRight") {
        keysPressed.right = false;
      }

      if (!keysPressed.left && !keysPressed.right && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };

    // Add event listeners to document
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup event listeners and animation on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <Page tabIndex={0}>
      <Meter
        targetValue={probability}
        maxValue={100}
        showNeedle={showNeedle}
        useColorGradient={useColorGradient}
        animationSpeed={isPresetAnimating ? 3 : 1}
      />
      <Instructions>Use left and right arrow keys to change value</Instructions>
      <ButtonContainer>
        <Button onClick={() => setShowNeedle(!showNeedle)}>
          {showNeedle ? "Hide Needle" : "Show Needle"}
        </Button>
        <Button onClick={() => setUseColorGradient(!useColorGradient)}>
          {useColorGradient ? "Use Standard Mode" : "Use Spectrum Mode"}
        </Button>
        <Button onClick={cyclePreset}>
          Set to {presetValues[(currentPresetIndex + 1) % presetValues.length]}%
        </Button>
      </ButtonContainer>
    </Page>
  );
}

export default Visualizer;
