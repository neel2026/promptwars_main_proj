import { describe, it, expect } from 'vitest';
import { validateName, validateExamType, validateMoodScore, validateJournalEntry, validateCheckIn } from '../utils/validation';

describe('Validation Utils', () => {
  it('validateName requires a non-empty string', () => {
    expect(validateName('').valid).toBe(false);
    expect(validateName('Arjun').valid).toBe(true);
  });

  it('validateExamType requires a valid exam type', () => {
    expect(validateExamType('').valid).toBe(false);
    expect(validateExamType('INVALID').valid).toBe(false);
    expect(validateExamType('JEE').valid).toBe(true);
  });

  it('validateMoodScore requires a number between 1 and 10', () => {
    expect(validateMoodScore(0).valid).toBe(false);
    expect(validateMoodScore(11).valid).toBe(false);
    expect(validateMoodScore(5).valid).toBe(true);
  });

  it('validateJournalEntry requires at least 5 characters', () => {
    expect(validateJournalEntry('hi').valid).toBe(false);
    expect(validateJournalEntry('This is a valid journal entry.').valid).toBe(true);
  });

  it('validateCheckIn validates all fields correctly', () => {
    const validFields = { name: 'Arjun', examType: 'JEE', moodScore: 5, journalEntry: 'Feeling good' };
    const invalidFields = { name: '', examType: 'JEE', moodScore: 5, journalEntry: 'Feeling good' };
    
    expect(validateCheckIn(validFields).valid).toBe(true);
    expect(validateCheckIn(invalidFields).valid).toBe(false);
    expect(validateCheckIn(invalidFields).errors.name).toBeDefined();
  });
});
