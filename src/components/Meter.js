import React, { useRef, useEffect, useCallback, useState } from "react";
import styled from "styled-components";

const MeterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Canvas = styled.canvas`
  background: transparent;
`;

const Meter = ({
  targetValue = 50,
  maxValue = 100,
  showNeedle = true,
  useColorGradient = false,
  animationSpeed = 0.05
}) => {
  const canvasRef = useRef(null);
  const [currentValue, setCurrentValue] = useState(targetValue);

  // Animation to target value with bouncy spring physics
  useEffect(() => {
    let animationFrame = null;
    let velocity = 0;

    const animate = () => {
      setCurrentValue((prev) => {
        const diff = targetValue - prev;

        // Stop animation when close enough and velocity is low
        if (Math.abs(diff) < 0.1 && Math.abs(velocity) < 0.5) {
          console.log("Animation complete:", targetValue);
          velocity = 0;
          return targetValue;
        }

        // Spring physics parameters - faster and more bouncy
        const springStrength = 0.1; // Higher spring force for faster movement
        const damping = 0.75; // Lower damping for more bounce

        // Calculate spring force (proportional to distance from target)
        const springForce = diff * springStrength;

        // Apply spring force to velocity
        velocity += springForce;

        // Apply damping to velocity
        velocity *= damping;

        // Calculate new position
        const newValue = prev + velocity;

        console.log(
          "Bouncing:",
          prev.toFixed(1),
          "→",
          newValue.toFixed(1),
          "target:",
          targetValue,
          "velocity:",
          velocity.toFixed(2)
        );

        // Continue animation
        animationFrame = requestAnimationFrame(animate);

        return newValue;
      });
    };

    // Reset velocity and start animation
    velocity = 0;
    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue]);

  // Helper function to interpolate between colors
  const interpolateColor = useCallback(
    (percentage) => {
      // If gradient is disabled, return black
      if (!useColorGradient) {
        return "#000";
      }

      // Convert percentage (0-100) to 0-1 range
      const t = percentage / 100;

      let r, g, b;

      if (t <= 0.5) {
        // Red to Yellowy Orange (0% to 50%)
        const localT = t * 2; // Scale to 0-1 for this segment
        r = 255;
        g = Math.round(200 * localT); // More yellowy orange is rgb(255, 200, 0)
        b = 0;
      } else {
        // Orange to Green (50% to 100%)
        const localT = (t - 0.5) * 2; // Scale to 0-1 for this segment
        r = Math.round(255 * (1 - localT));
        g = Math.round(200 + (180 - 200) * localT); // From yellowy orange to brighter green
        b = 0;
      }

      return `rgb(${r}, ${g}, ${b})`;
    },
    [useColorGradient]
  );

  const drawMeter = useCallback(
    (canvas, ctx, displayWidth, displayHeight, dpr) => {
      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const centerX = displayWidth / 2;
      const centerY = displayHeight / 2 + 250; // Move everything down
      const radius = 360; // Doubled radius

      // Draw main arc (-45° to +45°)
      ctx.beginPath();
      const startAngle = (Math.PI * 5) / 4; // 225° (bottom-left)
      const endAngle = (Math.PI * 7) / 4; // 315° (bottom-right)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);

      if (useColorGradient) {
        // Create gradient for main arc (red to green)
        const gradient = ctx.createLinearGradient(
          centerX - radius * Math.cos(Math.PI / 4), // Start point (left side)
          centerY,
          centerX + radius * Math.cos(Math.PI / 4), // End point (right side)
          centerY
        );
        gradient.addColorStop(0, "#ff0000"); // Red at 0%
        gradient.addColorStop(0.5, "#ffc800"); // More yellowy orange at 50%
        gradient.addColorStop(1, "#00b400"); // Slightly brighter green at 100%
        ctx.strokeStyle = gradient;
      } else {
        ctx.strokeStyle = "#000"; // Black for non-gradient mode
      }

      ctx.lineWidth = 8; // Doubled line width
      // ctx.lineCap = "round"; // Rounded corners for main arc
      // ctx.lineJoin = "round"; // Smooth joins for main arc
      ctx.stroke();

      // Draw scale marks and numbers
      const totalMarks = 18; // Fewer marks for smaller arc
      const majorMarkInterval = 9; // Every 9th mark is major (0%, 50%, 100%)

      for (let i = 0; i <= totalMarks; i++) {
        // Map from 225° to 315° (bottom-left to bottom-right)
        const angle = (Math.PI * 5) / 4 + (i / totalMarks) * (Math.PI / 2);
        const isMajorMark = i % majorMarkInterval === 0;

        // Calculate percentage for this tick mark (0-100%)
        const tickPercentage = (i / totalMarks) * 100;
        const tickColor = interpolateColor(tickPercentage);

        // Calculate tick marks extending radially from the arc
        const tickLength = isMajorMark ? 50 : 24; // Doubled tick lengths
        const arcRadius = radius - 1; // Start slightly inside the arc line
        const outerRadius = arcRadius + tickLength; // Extend outward

        const startX = centerX + Math.cos(angle) * arcRadius;
        const startY = centerY + Math.sin(angle) * arcRadius;
        const endX = centerX + Math.cos(angle) * outerRadius;
        const endY = centerY + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = tickColor;
        ctx.lineWidth = isMajorMark ? 6 : 3; // Doubled tick widths
        ctx.lineCap = "round"; // Rounded corners for tick marks
        ctx.lineJoin = "round"; // Smooth joins
        ctx.stroke();

        // Draw numbers for major marks
        if (isMajorMark) {
          // Direct mapping: 0% at -45°, 100% at +45°
          const displayValue = (i / totalMarks) * 100;

          const textRadius = radius - 40; // Closer to the range
          let textX = centerX + Math.cos(angle) * textRadius;
          let textY = centerY + Math.sin(angle) * textRadius;

          // Adjust positioning for 0% and 100% labels
          if (displayValue === 0) {
            textY += 10;
            textX -= 24; // Move 0% further left
          } else if (displayValue === 100) {
            textY += 10;
            textX += 32; // Move 100% further right
          }

          ctx.font = "bold 1.5rem system-ui"; // Doubled font size
          ctx.fillStyle = "#000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(displayValue.toFixed(0) + "%", textX, textY);
        }
      }

      // Calculate needle angle based on current value (-45° to +45°)
      // Map 0-100% value to 225° to 315° range (bottom-left to bottom-right)
      const minAngle = (Math.PI * 5) / 4; // 225° (bottom-left)
      const maxAngle = (Math.PI * 7) / 4; // 315° (bottom-right)

      const normalizedValue = currentValue / maxValue; // 0 to 1
      const needleAngle = minAngle + normalizedValue * (maxAngle - minAngle);

      // Draw needle (only if showNeedle is true)
      if (showNeedle) {
        const needleLength = radius + 50; // Extended needle length to move arm up
        const needleEndX = centerX + Math.cos(needleAngle) * needleLength;
        const needleEndY = centerY + Math.sin(needleAngle) * needleLength;

        // Shortened needle
        const shortenedStartRatio = 0.5;
        const needleStartX =
          centerX +
          Math.cos(needleAngle) * (needleLength * shortenedStartRatio);
        const needleStartY =
          centerY +
          Math.sin(needleAngle) * (needleLength * shortenedStartRatio);

        // Main needle
        ctx.beginPath();
        ctx.moveTo(needleStartX, needleStartY);
        ctx.lineTo(needleEndX, needleEndY);
        ctx.strokeStyle = useColorGradient ? "#000" : "#ff4444";
        ctx.lineWidth = 10; // Doubled needle width
        ctx.stroke();
      }
    },
    [currentValue, maxValue, showNeedle, useColorGradient, interpolateColor]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Get device pixel ratio for retina support
    const dpr = window.devicePixelRatio || 1;

    // Set display size (css pixels) - doubled scale
    const displayWidth = 1200;
    const displayHeight = 640;

    // Set actual canvas size in memory (scaled up for retina)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Scale the canvas back down using CSS
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr);

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the meter
    drawMeter(canvas, ctx, displayWidth, displayHeight, dpr);
  }, [currentValue, maxValue, showNeedle, useColorGradient, drawMeter]);

  return (
    <MeterContainer>
      <Canvas ref={canvasRef} />
    </MeterContainer>
  );
};

export default Meter;
