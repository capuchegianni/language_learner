import React, { useState } from 'react';
import { IconGrammarGazette, IconFleuronPlus, IconTrashShears, IconHazardAlert } from '../../components/icons';
import { useLanguages } from '../../contexts/LanguageContext';
import { useRuleBank } from './hooks/useRuleBank';
import { RuleCard } from './components/RuleCard';
import { RuleModal } from './components/RuleModal';
import { PageHeader, FilterBar, Input, LoadingSpinner, EmptyState, Button, Modal } from '../../components';
import { Rule } from '../../types';
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
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="rulebank-container">
      <PageHeader
        id="tutorial-rulebank-header"
        icon={<IconGrammarGazette size={40} />}
        title={`${targetLanguage} Grammar Rules`}
        subtitle={
          <>
            <span>All mastered grammar patterns and rules in your bank.</span>
            <br />
            <span>Total: {rules.length} rule{rules.length !== 1 ? 's' : ''}.</span>
          </>
        }
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
                onDelete={() => setRuleToDelete(rule)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={ruleToDelete !== null}
        onClose={() => !isDeleting && setRuleToDelete(null)}
        icon={<IconHazardAlert size={20} />}
        title="Delete Rule"
        maxWidth="440px"
        danger
      >
        <p className="modal-prompt-text">
          Are you sure you want to delete <strong>{ruleToDelete?.title}</strong> from your rule bank? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => setRuleToDelete(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isDeleting}
            icon={isDeleting ? undefined : <IconTrashShears size={16} />}
            onClick={async () => {
              if (!ruleToDelete) return;
              setIsDeleting(true);
              try {
                await deleteRule(ruleToDelete.id);
                setRuleToDelete(null);
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RuleBank;
