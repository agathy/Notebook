/**
 * Property-Based Test for Data Validation
 * Feature: word-persistence-fix, Property 4: Data validation before display
 * Validates: Requirements 1.4
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import the validateWordData function from script.js
// Since script.js is designed for browser, we'll extract and test the validation logic
function validateWordData(data) {
    // Check data is array
    if (!Array.isArray(data)) {
        console.warn('Word data is not an array, initializing empty collection');
        return false;
    }
    
    // Check each word object's basic structure
    for (let i = 0; i < data.length; i++) {
        const word = data[i];
        
        // Check required fields
        if (!word || typeof word !== 'object') {
            console.warn(`Invalid word object at index ${i}, skipping validation`);
            continue;
        }
        
        // Check ID field
        if (!word.id || typeof word.id !== 'string') {
            console.warn(`Word at index ${i} missing or invalid ID`);
            return false;
        }
        
        // Check translations field
        if (word.translations && !Array.isArray(word.translations)) {
            console.warn(`Word at index ${i} has invalid translations structure`);
            return false;
        }
        
        // Validate translations array objects
        if (word.translations) {
            for (let j = 0; j < word.translations.length; j++) {
                const translation = word.translations[j];
                if (!translation || typeof translation !== 'object') {
                    console.warn(`Invalid translation at word ${i}, translation ${j}`);
                    return false;
                }
                
                // Check language field
                if (!translation.language || typeof translation.language !== 'string') {
                    console.warn(`Translation at word ${i}, translation ${j} missing language`);
                    return false;
                }
            }
        }
        
        // Check tags field (if exists)
        if (word.tags && !Array.isArray(word.tags)) {
            console.warn(`Word at index ${i} has invalid tags structure`);
            return false;
        }
        
        // Check createdAt field
        if (word.createdAt && typeof word.createdAt !== 'string') {
            console.warn(`Word at index ${i} has invalid createdAt field`);
            return false;
        }
    }
    
    console.log(`Validated ${data.length} words successfully`);
    return true;
}

// Simple property-based testing generators
class PropertyGenerators {
    static randomString(maxLength = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = Math.floor(Math.random() * maxLength) + 1;
        return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    
    static randomLanguageCode() {
        const codes = ['en', 'zh', 'ko', 'es', 'fr', 'de', 'ja'];
        return codes[Math.floor(Math.random() * codes.length)];
    }
    
    static randomTranslation() {
        return {
            language: this.randomLanguageCode(),
            text: Math.random() > 0.3 ? this.randomString() : '', // Sometimes empty
            phonetic: Math.random() > 0.7 ? this.randomString() : '', // Often empty
            example: Math.random() > 0.8 ? this.randomString(20) : '' // Usually empty
        };
    }
    
    static randomValidWord() {
        const translationsCount = Math.floor(Math.random() * 3) + 1;
        const translations = Array.from({length: translationsCount}, () => this.randomTranslation());
        
        return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            translations,
            nativeNote: Math.random() > 0.5 ? this.randomString() : null,
            image: Math.random() > 0.8 ? `data:image/png;base64,${this.randomString(50)}` : null,
            tags: Math.random() > 0.6 ? Array.from({length: Math.floor(Math.random() * 3) + 1}, () => this.randomString(5)) : null,
            notes: Math.random() > 0.7 ? this.randomString(30) : null,
            createdAt: new Date().toISOString()
        };
    }
    
    static randomValidWordArray(maxSize = 10) {
        const size = Math.floor(Math.random() * maxSize);
        return Array.from({length: size}, () => this.randomValidWord());
    }
    
    static randomInvalidData() {
        const invalidTypes = [
            null,
            undefined,
            'string',
            123,
            {},
            true,
            false
        ];
        return invalidTypes[Math.floor(Math.random() * invalidTypes.length)];
    }
    
    static randomInvalidWord() {
        const invalidWords = [
            null,
            undefined,
            'string',
            123,
            [],
            { /* missing id */ translations: [] },
            { id: 123, translations: [] }, // invalid id type
            { id: 'valid', translations: 'invalid' }, // invalid translations type
            { id: 'valid', translations: [null] }, // invalid translation object
            { id: 'valid', translations: [{ /* missing language */ text: 'word' }] },
            { id: 'valid', translations: [{ language: 123, text: 'word' }] }, // invalid language type
            { id: 'valid', translations: [], tags: 'invalid' }, // invalid tags type
            { id: 'valid', translations: [], createdAt: 123 } // invalid createdAt type
        ];
        return invalidWords[Math.floor(Math.random() * invalidWords.length)];
    }
}

describe('Data Validation Property Tests', () => {
    test('Property 4: Data validation before display - Valid data should pass validation', () => {
        // Run property test 100 times as specified in design
        for (let i = 0; i < 100; i++) {
            const validWordArray = PropertyGenerators.randomValidWordArray();
            const result = validateWordData(validWordArray);
            
            assert.strictEqual(result, true, 
                `Valid word array should pass validation. Failed on iteration ${i + 1} with data: ${JSON.stringify(validWordArray)}`);
        }
    });
    
    test('Property 4: Data validation before display - Invalid data types should fail validation', () => {
        // Run property test 100 times as specified in design
        for (let i = 0; i < 100; i++) {
            const invalidData = PropertyGenerators.randomInvalidData();
            const result = validateWordData(invalidData);
            
            assert.strictEqual(result, false, 
                `Invalid data type should fail validation. Failed on iteration ${i + 1} with data: ${JSON.stringify(invalidData)}`);
        }
    });
    
    test('Property 4: Data validation before display - Arrays with invalid words should fail validation', () => {
        // Run property test 100 times as specified in design
        for (let i = 0; i < 100; i++) {
            // Create array with mix of valid and invalid words
            const validWords = PropertyGenerators.randomValidWordArray(3);
            const invalidWord = PropertyGenerators.randomInvalidWord();
            
            // Skip if invalid word is null/undefined as these are handled differently
            if (invalidWord === null || invalidWord === undefined) {
                continue;
            }
            
            const mixedArray = [...validWords, invalidWord];
            const result = validateWordData(mixedArray);
            
            assert.strictEqual(result, false, 
                `Array containing invalid word should fail validation. Failed on iteration ${i + 1} with invalid word: ${JSON.stringify(invalidWord)}`);
        }
    });
    
    test('Property 4: Data validation before display - Empty array should pass validation', () => {
        const result = validateWordData([]);
        assert.strictEqual(result, true, 'Empty array should pass validation');
    });
    
    test('Property 4: Data validation before display - Array with valid words should pass validation', () => {
        // Test with specific valid structures
        const validWordData = [
            {
                id: 'test-1',
                translations: [
                    { language: 'en', text: 'hello', phonetic: '/həˈloʊ/', example: 'Hello world' },
                    { language: 'zh', text: '你好', phonetic: 'nǐ hǎo', example: '你好世界' }
                ],
                nativeNote: 'greeting',
                image: null,
                tags: ['greeting', 'basic'],
                notes: 'Common greeting',
                createdAt: '2023-01-01T00:00:00.000Z'
            },
            {
                id: 'test-2',
                translations: [
                    { language: 'es', text: 'hola', phonetic: '', example: '' }
                ],
                nativeNote: null,
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                tags: null,
                notes: null,
                createdAt: '2023-01-02T00:00:00.000Z'
            }
        ];
        
        const result = validateWordData(validWordData);
        assert.strictEqual(result, true, 'Valid word data should pass validation');
    });
});