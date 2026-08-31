import React from 'react';
import { Scroll, Plus } from 'lucide-react';
import { useLanguages } from '../../contexts/LanguageContext';
import { useRuleBank } from './hooks/useRuleBank';
import { RuleCard } from './components/RuleCard';
import { RuleModal } from './components/RuleModal';
import { PageHeader, FilterBar, FilterInput, LoadingSpinner, EmptyState } from '../../components';
import './RuleBank.css';

export const RuleBank: React.FC = () => {
  const { targetLanguage } = useLanguages();
  const {
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
  } = useRuleBank();

  return (
    <div className="rulebank-container">
      <PageHeader
        id="tutorial-rulebank-header"
        icon={<Scroll style={{ color: 'var(--accent-purple)' }} />}
        title="Mastered Grammar Rule Bank"
        subtitle={`A comprehensive index of all ${targetLanguage} grammar rules learned in lessons. Total: ${rules.length} rules.`}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            id="tutorial-rulebank-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            <span>Add Custom Rule</span>
          </button>
        }
      />

      <FilterBar id="tutorial-rulebank-filter">
        <FilterInput
          id="rulebank-search-input"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search rule title or explanation..."
        />
      </FilterBar>

      <div id="tutorial-rulebank-list">
        {loading ? (
          <LoadingSpinner variant="card" />
        ) : rules.length === 0 ? (
          <EmptyState message="No grammar rules found matching your search." />
        ) : (
          <div className="rules-list-container">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={openEditModal}
                onDelete={deleteRule}
              />
            ))}
          </div>
        )}
      </div>

      <RuleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingRule={editingRule}
        formData={formData}
        onFieldChange={updateFormField}
        onSubmit={saveRule}
      />
    </div>
  );
};

export default RuleBank;
