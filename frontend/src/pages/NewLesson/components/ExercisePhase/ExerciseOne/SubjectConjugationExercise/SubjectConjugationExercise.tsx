import React, { useState, useEffect, useRef } from 'react';
import { IconLinotypeLayers } from '../../../../../../components/icons';
import { Input } from '../../../../../../components';
import { ExerciseOneComponentProps } from '../types';
import './subjectConjugation.css';

/**
 * Parses a serialized conjugation string back into an array of cell values
 * matching the order of the provided subject pronouns.
 */
export function parseConjugationRow(
  raw: string | undefined,
  pronouns: string[]
): string[] {
  const result: string[] = pronouns.map(() => '');
  if (!raw || !raw.trim()) return result;

  const trimmed = raw.trim();

  // 1. JSON check
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      pronouns.forEach((p, idx) => {
        if (obj[p] !== undefined) result[idx] = String(obj[p]);
      });
      return result;
    } catch {
      // Ignore JSON error
    }
  }

  // 2. Pattern: "pronoun: value"
  const escapedPronouns = pronouns.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pronounPattern = new RegExp(
    `(?:^|[,|\\n])\\s*(${escapedPronouns.join('|')})\\s*:\\s*`,
    'gi'
  );

  const matches: { pronoun: string; index: number; contentStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pronounPattern.exec(trimmed)) !== null) {
    matches.push({
      pronoun: m[1].toLowerCase(),
      index: m.index,
      contentStart: m.index + m[0].length,
    });
  }

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex =
        i + 1 < matches.length ? matches[i + 1].index : trimmed.length;
      let val = trimmed.slice(current.contentStart, nextIndex).trim();
      val = val.replace(/[,|]+$/, '').trim();

      const pIdx = pronouns.findIndex(
        (p) => p.toLowerCase() === current.pronoun
      );
      if (pIdx !== -1) {
        result[pIdx] = val;
      }
    }
    return result;
  }

  // 3. Fallback: comma-separated values (e.g. "je parle, tu parles, ..." or "parle, parles, ...")
  const parts = trimmed.split(',').map((s) => s.trim());
  if (parts.length > 0) {
    parts.forEach((part, idx) => {
      if (idx < pronouns.length) {
        const p = pronouns[idx];
        if (part.toLowerCase().startsWith(p.toLowerCase() + ' ')) {
          result[idx] = part.slice(p.length).trim();
        } else {
          result[idx] = part;
        }
      }
    });
    return result;
  }

  return result;
}

/**
 * Serializes an array of cell values back into a readable "pronoun: value" string.
 */
export function serializeConjugationRow(
  rowValues: string[],
  pronouns: string[]
): string {
  const hasContent = rowValues.some((v) => v && v.trim().length > 0);
  if (!hasContent) return '';

  return pronouns
    .map((p, idx) => `${p}: ${rowValues[idx]?.trim() || ''}`)
    .join(', ');
}

export const SubjectConjugationExercise: React.FC<ExerciseOneComponentProps> = ({
  instruction,
  targetWords,
  subjectPronouns,
  answers,
  onAnswerChange,
}) => {
  const activePronouns = subjectPronouns || [];
  const lastEmittedRef = useRef<string[]>([]);

  const [cellMatrix, setCellMatrix] = useState<string[][]>(() => {
    return targetWords.map((_, vIdx) =>
      parseConjugationRow(answers[vIdx], activePronouns)
    );
  });

  // Synchronize when external answers change (e.g. loaded/resumed)
  useEffect(() => {
    const hasExternalDiff = targetWords.some((_, vIdx) => {
      const currentEmitted = lastEmittedRef.current[vIdx];
      return (answers[vIdx] || '') !== (currentEmitted || '');
    });

    if (hasExternalDiff) {
      const newMatrix = targetWords.map((_, vIdx) => {
        const parsed = parseConjugationRow(answers[vIdx], activePronouns);
        lastEmittedRef.current[vIdx] = answers[vIdx] || '';
        return parsed;
      });
      setCellMatrix(newMatrix);
    }
  }, [answers, targetWords, activePronouns]);

  const handleCellChange = (vIdx: number, pIdx: number, val: string) => {
    setCellMatrix((prev) => {
      const updated = prev.map((row, rIdx) => {
        if (rIdx !== vIdx) return row;
        const newRow = [...row];
        newRow[pIdx] = val;
        return newRow;
      });

      const serialized = serializeConjugationRow(
        updated[vIdx],
        activePronouns
      );
      lastEmittedRef.current[vIdx] = serialized;
      onAnswerChange(vIdx, serialized);
      return updated;
    });
  };

  // Fallback if no subject pronouns provided
  if (!activePronouns || activePronouns.length === 0) {
    return (
      <div className="ex1-container">
        <div className="ex1-header-block">
          <span className="ex1-type-badge">
            <IconLinotypeLayers size={13} />
            Conjugation Paradigm Drill
          </span>
          <p className="ex1-instruction">{instruction}</p>
        </div>

        <div className="ex1-conjugation-list">
          {targetWords.map((verb, idx) => (
            <div key={idx} className="ex1-conjugation-card">
              <span className="ex1-verb-title target-text">
                {idx + 1}. {verb}
              </span>
              <Input
                type="text"
                id={`ex1-conj-${idx}`}
                placeholder={`Conjugate "${verb}" for all subjects separated by commas...`}
                value={answers[idx] || ''}
                onChange={(e) => onAnswerChange(idx, e.target.value)}
                className="exercise-text-input ex1-conjugation-input"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ex1-container">
      <div className="ex1-header-block">
        <span className="ex1-type-badge">
          <IconLinotypeLayers size={13} />
          Conjugation Paradigm Drill
        </span>
        <p className="ex1-instruction">{instruction}</p>
      </div>

      <div className="ex1-table-container">
        <div className="ex1-table-scroll-wrapper">
          <table className="ex1-conj-table">
            <thead>
              <tr>
                <th className="ex1-table-pronoun-th">subject</th>
                {targetWords.map((verb, vIdx) => (
                  <th key={vIdx} className="ex1-table-verb-th target-text">
                    {verb}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activePronouns.map((pronoun, pIdx) => (
                <tr key={pIdx}>
                  <td className="ex1-table-pronoun-cell">
                    <span className="ex1-table-pronoun-tag">{pronoun}</span>
                  </td>
                  {targetWords.map((verb, vIdx) => (
                    <td key={vIdx} className="ex1-table-cell-wrapper">
                      <Input
                        type="text"
                        id={`ex1-conj-cell-${vIdx}-${pIdx}`}
                        value={cellMatrix[vIdx]?.[pIdx] || ''}
                        onChange={(e) =>
                          handleCellChange(vIdx, pIdx, e.target.value)
                        }
                        className="ex1-table-direct-input"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectConjugationExercise;
