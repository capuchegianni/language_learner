import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Key,
  Cpu,
  Globe,
  Scroll,
  BookOpen,
  Volume2,
  Clock,
  Award,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useTutorial } from './TutorialContext';
import { TargetRect } from './types';
import './TutorialOverlay.css';

export const TutorialOverlay: React.FC = () => {
  const {
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial();

  const location = useLocation();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number; placement: string } | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const cardRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const scrolledStepRef = useRef<string | null>(null);

  // Helper to render icon based on step.iconName
  const renderStepIcon = (name?: string) => {
    switch (name) {
      case 'Key':
        return <Key size={20} className="tutorial-icon-key" />;
      case 'Cpu':
        return <Cpu size={20} className="tutorial-icon-cpu" />;
      case 'Globe':
        return <Globe size={20} className="tutorial-icon-globe" />;
      case 'Scroll':
        return <Scroll size={20} className="tutorial-icon-scroll" />;
      case 'BookOpen':
        return <BookOpen size={20} className="tutorial-icon-book" />;
      case 'Volume2':
        return <Volume2 size={20} className="tutorial-icon-audio" />;
      case 'Clock':
        return <Clock size={20} className="tutorial-icon-clock" />;
      case 'Award':
        return <Award size={20} className="tutorial-icon-award" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={20} className="tutorial-icon-check" />;
      case 'Sparkles':
      default:
        return <Sparkles size={20} className="tutorial-icon-sparkles" />;
    }
  };

  // Reset scrolled flag when step changes
  useEffect(() => {
    scrolledStepRef.current = null;
  }, [currentStepIndex]);

  // Lock body scroll and prevent manual scrolling / touch gestures when tutorial is active
  useEffect(() => {
    if (!isActive) return;

    // Lock body and html scrolling
    document.body.classList.add('tutorial-active');
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Prevent wheel and touch dragging everywhere except if card itself is scrollable
    const handleWheel = (e: WheelEvent) => {
      if (cardRef.current && cardRef.current.contains(e.target as Node)) {
        const isScrollable = cardRef.current.scrollHeight > cardRef.current.clientHeight;
        if (isScrollable) return;
      }
      e.preventDefault();
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (cardRef.current && cardRef.current.contains(e.target as Node)) {
        const isScrollable = cardRef.current.scrollHeight > cardRef.current.clientHeight;
        if (isScrollable) return;
      }
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent keyboard page scrolling keys (Space, PageUp, PageDown, Home, End, Arrows)
    const handleScrollKeys = (e: KeyboardEvent) => {
      const scrollKeys = ['Space', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'];
      if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key)) {
        const targetTag = (e.target as HTMLElement)?.tagName;
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    window.addEventListener('keydown', handleScrollKeys, { capture: true });

    return () => {
      document.body.classList.remove('tutorial-active');
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      window.removeEventListener('keydown', handleScrollKeys, { capture: true });
    };
  }, [isActive]);

  // Find target element, perform smooth directional scroll, and update coordinates
  const updateTargetPosition = useCallback(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const padding = currentStep.highlightPadding ?? 10;

      // Perform designated scroll on step activation
      if (scrolledStepRef.current !== currentStep.id) {
        scrolledStepRef.current = currentStep.id;

        const scrollBlock = currentStep.scrollBlock || 'center';
        const scrollOffset = currentStep.scrollOffset ?? 70;

        if (scrollBlock === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (scrollBlock === 'start') {
          const elementRect = element.getBoundingClientRect();
          const targetScrollY = window.scrollY + elementRect.top - scrollOffset;
          window.scrollTo({ top: Math.max(0, targetScrollY), behavior: 'smooth' });
        } else if (scrollBlock === 'center') {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
      }

      // Read bounding rect
      const updatedRect = element.getBoundingClientRect();
      setTargetRect({
        x: Math.max(0, updatedRect.left - padding),
        y: Math.max(0, updatedRect.top - padding),
        width: updatedRect.width + padding * 2,
        height: updatedRect.height + padding * 2,
        top: updatedRect.top - padding,
        left: updatedRect.left - padding,
        right: updatedRect.right + padding,
        bottom: updatedRect.bottom + padding,
      });
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep]);

  // Handle route change, step change, resize & scroll
  useEffect(() => {
    if (!isActive) return;

    // Retry finding the target element periodically if it hasn't rendered yet
    let retries = 0;
    const maxRetries = 15;
    const interval = setInterval(() => {
      updateTargetPosition();
      retries++;
      if (retries >= maxRetries) {
        clearInterval(interval);
      }
    }, 100);

    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      updateTargetPosition();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, currentStep, location.pathname, updateTargetPosition]);

  // Calculate Popover Position relative to targetRect
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const cardEl = cardRef.current;
    const cardWidth = cardEl ? cardEl.offsetWidth : 400;
    const cardHeight = cardEl ? cardEl.offsetHeight : 230;
    const margin = 14;
    const vWidth = window.innerWidth;
    const vHeight = window.innerHeight;

    if (!targetRect) {
      // Center card on screen if no specific target or while loading
      setCardPos({
        left: Math.max(margin, (vWidth - cardWidth) / 2),
        top: Math.max(margin, (vHeight - cardHeight) / 2),
        placement: 'center',
      });
      return;
    }

    const requestedPlacement = currentStep.placement || 'auto';
    let chosenPlacement = requestedPlacement;

    const spaceBelow = vHeight - targetRect.bottom - margin;
    const spaceAbove = targetRect.top - margin;
    const spaceRight = vWidth - targetRect.right - margin;
    const spaceLeft = targetRect.left - margin;

    if (requestedPlacement === 'auto') {
      if (spaceBelow >= cardHeight) {
        chosenPlacement = 'bottom';
      } else if (spaceAbove >= cardHeight) {
        chosenPlacement = 'top';
      } else if (spaceRight >= cardWidth) {
        chosenPlacement = 'right';
      } else if (spaceLeft >= cardWidth) {
        chosenPlacement = 'left';
      } else {
        chosenPlacement = 'bottom';
      }
    }

    let top = 0;
    let left = 0;

    if (chosenPlacement === 'bottom') {
      top = targetRect.bottom + margin;
      if (top + cardHeight > vHeight - margin) {
        if (spaceAbove >= cardHeight) {
          top = targetRect.top - cardHeight - margin;
          chosenPlacement = 'top';
        } else {
          top = Math.max(margin, vHeight - cardHeight - margin);
        }
      }
      left = targetRect.left + (targetRect.width - cardWidth) / 2;
    } else if (chosenPlacement === 'top') {
      top = targetRect.top - cardHeight - margin;
      if (top < margin) {
        if (spaceBelow >= cardHeight) {
          top = targetRect.bottom + margin;
          chosenPlacement = 'bottom';
        } else {
          top = margin;
        }
      }
      left = targetRect.left + (targetRect.width - cardWidth) / 2;
    } else if (chosenPlacement === 'right') {
      left = targetRect.right + margin;
      top = targetRect.top + (targetRect.height - cardHeight) / 2;
    } else if (chosenPlacement === 'left') {
      left = targetRect.left - cardWidth - margin;
      top = targetRect.top + (targetRect.height - cardHeight) / 2;
    } else {
      left = (vWidth - cardWidth) / 2;
      top = (vHeight - cardHeight) / 2;
    }

    // Clamp inside viewport
    left = Math.max(margin, Math.min(left, vWidth - cardWidth - margin));
    top = Math.max(margin, Math.min(top, vHeight - cardHeight - margin));

    setCardPos({ top, left, placement: chosenPlacement });
  }, [isActive, currentStep, targetRect, viewportSize]);

  // Focus management & Focus trap
  useEffect(() => {
    if (!isActive) return;

    // Focus the primary action button after transition
    const timer = setTimeout(() => {
      if (nextBtnRef.current) {
        nextBtnRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isActive, currentStepIndex]);

  // Keyboard navigation & Tab focus trap
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTutorial();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
        return;
      }

      // Trap Tab focus inside the tutorial dialog
      if (e.key === 'Tab' && cardRef.current) {
        const focusableElements = cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isActive, nextStep, prevStep, skipTutorial]);

  // Block any interaction that bubbles to the background
  const handleBlockInteraction = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isActive || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div
      className="tutorial-container"
      aria-modal="true"
      role="dialog"
      aria-labelledby="tutorial-step-title"
      onPointerDown={handleBlockInteraction}
      onMouseDown={handleBlockInteraction}
      onTouchStart={handleBlockInteraction}
      onClick={handleBlockInteraction}
      onContextMenu={handleBlockInteraction}
    >
      {/* Non-clickable dark filter SVG with cutout spotlight */}
      <svg
        className="tutorial-svg-backdrop"
        width={viewportSize.width}
        height={viewportSize.height}
        viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White area = visible dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout = transparent spotlight on active element */}
            {targetRect && (
              <rect
                x={targetRect.x}
                y={targetRect.y}
                width={targetRect.width}
                height={targetRect.height}
                rx="14"
                ry="14"
                fill="black"
                className="tutorial-mask-cutout"
              />
            )}
          </mask>
        </defs>

        {/* The dark overlay filled with mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(10, 15, 29, 0.82)"
          mask="url(#tutorial-spotlight-mask)"
          className="tutorial-backdrop-rect"
        />
      </svg>

      {/* Full-screen invisible interaction blocker layer (blocks presses inside cutout as well) */}
      <div
        className="tutorial-interaction-blocker"
        onPointerDown={handleBlockInteraction}
        onMouseDown={handleBlockInteraction}
        onTouchStart={handleBlockInteraction}
        onClick={handleBlockInteraction}
        onContextMenu={handleBlockInteraction}
      />

      {/* Spotlight glow border ring */}
      {targetRect && (
        <div
          className="tutorial-spotlight-ring"
          style={{
            top: targetRect.y,
            left: targetRect.x,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Floating Tutorial Card */}
      <div
        ref={cardRef}
        className="tutorial-popover-card glass-card"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          top: cardPos ? `${cardPos.top}px` : '50%',
          left: cardPos ? `${cardPos.left}px` : '50%',
          transform: cardPos ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {/* Top Header Bar */}
        <div className="tutorial-card-header">
          <div className="tutorial-header-left">
            <span className="tutorial-step-badge">{currentStep.badge}</span>
            <span className="tutorial-step-counter">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>

          <button
            type="button"
            className="tutorial-close-btn"
            onClick={skipTutorial}
            aria-label="Skip Tutorial"
            title="Skip Tutorial"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="tutorial-progress-track">
          <div className="tutorial-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Card Body */}
        <div className="tutorial-card-body">
          <div className="tutorial-title-row">
            <div className="tutorial-icon-box">{renderStepIcon(currentStep.iconName)}</div>
            <h3 id="tutorial-step-title" className="tutorial-step-title">
              {currentStep.title}
            </h3>
          </div>

          <p id="tutorial-step-desc" className="tutorial-step-description">
            {currentStep.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="tutorial-card-footer">
          <button
            type="button"
            className="btn btn-secondary tutorial-skip-btn"
            onClick={skipTutorial}
            id="tutorial-skip-btn"
          >
            <span>Skip</span>
          </button>

          <div className="tutorial-nav-buttons">
            <button
              type="button"
              className="btn btn-secondary tutorial-prev-btn"
              onClick={prevStep}
              disabled={isFirstStep}
              style={{ opacity: isFirstStep ? 0.4 : 1, cursor: isFirstStep ? 'not-allowed' : 'pointer' }}
              id="tutorial-prev-btn"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              ref={nextBtnRef}
              type="button"
              className="btn btn-primary tutorial-next-btn"
              onClick={nextStep}
              id="tutorial-next-btn"
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {isLastStep ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
