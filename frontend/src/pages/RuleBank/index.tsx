import React from 'react';
import { IconGrammarGazette, IconFleuronPlus } from '../../components/icons';
import { useLanguages } from '../../contexts/LanguageContext';
import { useRuleBank } from './hooks/useRuleBank';
import { RuleCard } from './components/RuleCard';
import { RuleModal } from './components/RuleModal';
import { PageHeader, FilterBar, Input, LoadingSpinner, EmptyState, Button } from '../../components';
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
        icon={<IconGrammarGazette size={40} />}
        title={`${targetLanguage} Grammar Rules`}
        subtitle={`All mastered grammar patterns and rules in your bank. Total: ${rules.length} rule${rules.length !== 1 ? 's' : ''}.`}
        actions={
          <Button
            variant="primary"
            id="tutorial-rulebank-add-btn"
            onClick={openAddModal}
            icon={<IconFleuronPlus size={18} />}
          >
            <span>Add Custom Rule</span>
          </Button>
        }
      />

      <FilterBar id="tutorial-rulebank-filter">
        <Input
          variant="filter"
          id="rulebank-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          clearable
          onClear={() => setSearchQuery('')}
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
