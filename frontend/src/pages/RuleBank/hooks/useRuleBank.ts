import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { Rule } from '../../../types';
import { RuleFormData, DEFAULT_RULE_FORM, RuleExample } from '../types';

export interface UseRuleBankReturn {
  rules: Rule[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  isModalOpen: boolean;
  editingRule: Rule | null;
  formData: RuleFormData;
  updateFormField: <K extends keyof RuleFormData>(field: K, value: RuleFormData[K]) => void;
  openAddModal: () => void;
  openEditModal: (rule: Rule) => void;
  closeModal: () => void;
  saveRule: (e: React.SubmitEvent) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

export function useRuleBank(): UseRuleBankReturn {
  const [rules, setRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(DEFAULT_RULE_FORM);

  const loadRules = useCallback(async (q?: string) => {
    try {
      setLoading(true);
      const data = await api.getRules(q);
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules(searchQuery);
  }, [searchQuery, loadRules]);

  const openAddModal = useCallback(() => {
    setEditingRule(null);
    setFormData(DEFAULT_RULE_FORM);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((rule: Rule) => {
    setEditingRule(rule);
    let formattedExamplesText = rule.examples || '';
    try {
      const parsedEx: RuleExample[] = JSON.parse(rule.examples || '[]');
      if (Array.isArray(parsedEx)) {
        formattedExamplesText = parsedEx
          .map((e) => `${e.targetLanguage} = ${e.nativeLanguage}`)
          .join('\n');
      }
    } catch {
      // keep raw
    }

    setFormData({
      title: rule.title,
      explanation: rule.explanation,
      examplesText: formattedExamplesText,
      exceptions: rule.exceptions || '',
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRule(null);
  }, []);

  const updateFormField = useCallback(
    <K extends keyof RuleFormData>(field: K, value: RuleFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const saveRule = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.explanation) return;

      const formattedExamples: RuleExample[] = formData.examplesText
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split('=');
          return {
            targetLanguage: parts[0]?.trim() || line,
            nativeLanguage: parts[1]?.trim() || '',
          };
        });

      try {
        if (editingRule) {
          await api.updateRule(editingRule.id, {
            title: formData.title,
            explanation: formData.explanation,
            examples: JSON.stringify(formattedExamples),
            exceptions: formData.exceptions,
          });
        } else {
          await api.createRule({
            title: formData.title,
            explanation: formData.explanation,
            examples: JSON.stringify(formattedExamples),
            exceptions: formData.exceptions,
          });
        }
        setIsModalOpen(false);
        await loadRules(searchQuery);
      } catch (err) {
        console.error('Failed to save rule', err);
      }
    },
    [editingRule, formData, searchQuery, loadRules],
  );

  const deleteRule = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          'Are you sure you want to delete this rule from your bank?',
        )
      ) {
        try {
          await api.deleteRule(id);
          await loadRules(searchQuery);
        } catch (err) {
          console.error('Failed to delete rule', err);
        }
      }
    },
    [searchQuery, loadRules],
  );

  return {
    rules,
    searchQuery,
    setSearchQuery,
    loading,
    isModalOpen,
    editingRule,
    formData,
    updateFormField,
    openAddModal,
    openEditModal,
    closeModal,
    saveRule,
    deleteRule,
  };
}
