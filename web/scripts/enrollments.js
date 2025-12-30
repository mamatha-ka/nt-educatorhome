       let parentCount = 1;
        const MAX_PARENTS = 3;

        function validatePrimaryContact() {
                    const currentParentCount = document.querySelectorAll('.parent-entry').length;
                    const addButton = document.getElementById('add-parent-btn');

                    // Validate Primary Parent (index 0)
                    const name0 = document.querySelector('input[name="parent-name-0"]').value.trim();
                    const relationship0 = document.querySelector('select[name="parent-relationship-0"]').value;
                    const contact0 = document.querySelector('input[name="parent-contact-0"]').value.trim();
                    const aadhaar0 = document.querySelector('input[name="parent-aadhaar-0"]').value.trim();

                    let isValid0 = name0 && relationship0 && contact0.length === 10 && /^[0-9]{10}$/.test(contact0) && aadhaar0.length === 12;

                    // If guardian is selected, also check guardian relationship field
                    if (relationship0 === 'guardian') {
                        const guardianRelationship0 = document.querySelector('input[name="guardian-relationship-0"]').value.trim();
                        isValid0 = isValid0 && guardianRelationship0;
                    }

                    // If we have 2 parents (Parent 1 exists), validate Parent 2 as well
                    let isValid1 = true;
                    if (currentParentCount >= 2) {
                        const name1 = document.querySelector('input[name="parent-name-1"]');
                        const relationship1 = document.querySelector('select[name="parent-relationship-1"]');
                        const contact1 = document.querySelector('input[name="parent-contact-1"]');

                        if (name1 && relationship1 && contact1) {
                            const contact1Value = contact1.value.trim();
                            isValid1 = name1.value.trim() && relationship1.value && contact1Value.length === 10 && /^[0-9]{10}$/.test(contact1Value);

                            // If guardian is selected for parent 2, check guardian relationship
                            if (relationship1.value === 'guardian') {
                                const guardianRelationship1 = document.querySelector('input[name="guardian-relationship-1"]');
                                if (guardianRelationship1) {
                                    isValid1 = isValid1 && guardianRelationship1.value.trim();
                                }
                            }
                        }
                    }

                    // Enable button only if:
                    // 1. Primary parent is complete AND
                    // 2. If Parent 2 exists, it must be complete AND
                    // 3. Haven't reached max limit
                    const buttonContainer = document.getElementById('add-parent-btn').parentElement;
                    const helperText = buttonContainer.querySelector('.text-xs');

                    if (isValid0 && isValid1 && currentParentCount < MAX_PARENTS) {
                        addButton.disabled = false;
                        addButton.className = 'bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200 border border-blue-200 cursor-pointer';
                        const remainingSlots = MAX_PARENTS - currentParentCount;
                        if (currentParentCount === 1) {
                            helperText.textContent = `Add up to ${remainingSlots} more parent(s)/guardian(s)`;
                        } else {
                            helperText.textContent = `Add 1 more parent/guardian`;
                        }
                    } else {
                        addButton.disabled = true;
                        if (currentParentCount >= MAX_PARENTS) {
                            addButton.className = 'bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed transition-colors duration-200 border border-gray-300';
                            helperText.textContent = 'Maximum limit of 3 parents/guardians reached';
                        } else if (currentParentCount === 1) {
                            addButton.className = 'bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed transition-colors duration-200 border border-gray-300';
                            helperText.textContent = 'Complete primary parent details to add more parents/guardians';
                        } else if (currentParentCount === 2) {
                            addButton.className = 'bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed transition-colors duration-200 border border-gray-300';
                            helperText.textContent = 'Complete Parent/Guardian 2 details to add another parent/guardian';
                        }
                    }
                }

        function handleRelationshipChange(index) {
            const relationshipSelect = document.querySelector(`select[name="parent-relationship-${index}"]`);
            const aadhaarField = document.getElementById(`aadhaar-field-${index}`);
            const guardianField = document.getElementById(`guardian-relationship-field-${index}`);
            const guardianInput = document.querySelector(`input[name="guardian-relationship-${index}"]`);

            // For first parent (index 0), Aadhaar is always required and visible
            if (index === 0) {
                // Aadhaar field is always visible and required for first parent
                aadhaarField.style.display = 'block';
                document.querySelector(`input[name="parent-aadhaar-${index}"]`).required = true;
            } else {
                // For other parents, Aadhaar is not required
                aadhaarField.style.display = 'none';
                document.querySelector(`input[name="parent-aadhaar-${index}"]`).required = false;
            }

            // Handle guardian relationship field
            if (relationshipSelect.value === 'guardian') {
                guardianField.style.display = 'block';
                guardianInput.required = true;
            } else {
                guardianField.style.display = 'none';
                guardianInput.required = false;
                guardianInput.value = '';
            }

            // Update all dropdowns to disable already selected father/mother options
            updateRelationshipDropdowns();
        }

        function updateRelationshipDropdowns() {
            // Get all parent entries
            const parentEntries = document.querySelectorAll('.parent-entry');

            // Collect currently selected relationships
            const selectedRelationships = [];
            parentEntries.forEach((entry, idx) => {
                const select = entry.querySelector(`select[name="parent-relationship-${idx}"]`);
                if (select && select.value && (select.value === 'mother' || select.value === 'father')) {
                    selectedRelationships.push({
                        index: idx,
                        value: select.value
                    });
                }
            });

            // Update each dropdown
            parentEntries.forEach((entry, idx) => {
                const select = entry.querySelector(`select[name="parent-relationship-${idx}"]`);
                if (!select) return;

                const currentValue = select.value;

                // Get all options
                const motherOption = select.querySelector('option[value="mother"]');
                const fatherOption = select.querySelector('option[value="father"]');

                // Check if mother is selected elsewhere
                const motherSelectedElsewhere = selectedRelationships.some(rel =>
                    rel.value === 'mother' && rel.index !== idx
                );

                // Check if father is selected elsewhere
                const fatherSelectedElsewhere = selectedRelationships.some(rel =>
                    rel.value === 'father' && rel.index !== idx
                );

                // Hide/show options by adding/removing them from the DOM
                if (motherOption) {
                    if (motherSelectedElsewhere) {
                        motherOption.style.display = 'none';
                        motherOption.disabled = true;
                    } else {
                        motherOption.style.display = '';
                        motherOption.disabled = false;
                    }
                }

                if (fatherOption) {
                    if (fatherSelectedElsewhere) {
                        fatherOption.style.display = 'none';
                        fatherOption.disabled = true;
                    } else {
                        fatherOption.style.display = '';
                        fatherOption.disabled = false;
                    }
                }
            });
        }

        function addParentField() {
            if (parentCount >= MAX_PARENTS) {
                return; // Prevent adding more than 3 parents
            }

            const container = document.getElementById('parents-container');
            const addButton = container.querySelector('.text-center');

            const newParentDiv = document.createElement('div');
            newParentDiv.className = 'parent-entry bg-gray-50 rounded-lg p-4 mb-4';
            newParentDiv.setAttribute('data-parent-index', parentCount);

            newParentDiv.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h5 class="font-medium text-gray-700">Parent/Guardian ${parentCount + 1}</h5>
                    <button type="button" onclick="removeParentField(${parentCount})" class="text-red-600 hover:text-red-800 text-sm"> Remove </button>
                </div>
                <div class="grid md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" name="parent-name-${parentCount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required oninput="validatePrimaryContact()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                        <select name="parent-relationship-${parentCount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required onchange="handleRelationshipChange(${parentCount}); validatePrimaryContact()">
                            <option value="">Select relationship</option>
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                            <option value="guardian">Guardian</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                        <input type="tel" name="parent-contact-${parentCount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter 10-digit mobile number" pattern="[0-9]{10}" maxlength="10" required oninput="validatePrimaryContact()">
                        <p class="text-xs text-gray-500 mt-1">Enter 10 digits without spaces or special characters</p>
                    </div>
                </div>

                <div class="mt-4" id="guardian-relationship-field-${parentCount}" style="display: none;">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Guardian Relationship <span class="text-red-500">*</span></label>
                    <input type="text" name="guardian-relationship-${parentCount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Uncle, Aunt, Grandfather, Family Friend, etc." required oninput="validatePrimaryContact()">
                    <p class="text-xs text-gray-500 mt-1">Please specify your relationship to the student</p>
                </div>

                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Address (if different from student)</label>
                    <textarea name="parent-address-${parentCount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="2" placeholder="Leave blank if same as student address"></textarea>
                </div>
                <div class="mt-3" id="aadhaar-field-${parentCount}" style="display: none;">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                    <input type="text" name="parent-aadhaar-${parentCount}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter 12-digit Aadhaar number (optional)" pattern="[0-9]{12}" maxlength="12">
                    <p class="text-xs text-gray-500 mt-1">Optional field. Enter 12 digits without spaces.</p>
                </div>
                <div class="mt-3">
                    <label class="flex items-center">
                        <input type="checkbox" name="parent-primary-${parentCount}" class="mr-2 text-blue-600 focus:ring-blue-500" onchange="setPrimaryContact(${parentCount})">
                        <span class="text-sm text-gray-700">Primary contact for emergencies</span>
                    </label>
                </div>

            `;

            container.insertBefore(newParentDiv, addButton);
            parentCount++;

            // Update button state after adding
            validatePrimaryContact();

            // Update all dropdowns to reflect already selected relationships
            updateRelationshipDropdowns();
        }

        function removeParentField(index) {
            // Prevent removing the primary parent (index 0)
            if (index === 0) {
                return;
            }

            const parentEntry = document.querySelector(`[data-parent-index="${index}"]`);
            parentEntry.remove();
            parentCount--;

            // Update button state after removing
            validatePrimaryContact();

            // Update dropdowns to re-enable options
            updateRelationshipDropdowns();
        }

        function setPrimaryContact(index) {
            // Uncheck all other primary contact checkboxes
            const allPrimaryCheckboxes = document.querySelectorAll('input[name^="parent-primary-"]');
            allPrimaryCheckboxes.forEach(checkbox => {
                if (checkbox.name !== `parent-primary-${index}`) {
                    checkbox.checked = false;
                }
            });
        }

        function handleParentEnrollSubmit() {
            const errorMessage = document.getElementById('error-message');
            const errorText = errorMessage.querySelector('p');
            const errors = [];

            // Get all parent entries
            const parentEntries = document.querySelectorAll('.parent-entry');

            // Validate each parent entry
            parentEntries.forEach((entry, index) => {
                const parentNum = index === 0 ? 'Primary Parent' : `Parent/Guardian ${index + 1}`;

                // Check name
                const nameInput = entry.querySelector(`input[name="parent-name-${index}"]`);
                if (!nameInput.value.trim()) {
                    errors.push(`${parentNum}: Full Name is required`);
                }

                // Check relationship
                const relationshipSelect = entry.querySelector(`select[name="parent-relationship-${index}"]`);
                if (!relationshipSelect.value) {
                    errors.push(`${parentNum}: Relationship is required`);
                }

                // Check guardian relationship if guardian is selected
                if (relationshipSelect.value === 'guardian') {
                    const guardianRelInput = entry.querySelector(`input[name="guardian-relationship-${index}"]`);
                    if (!guardianRelInput.value.trim()) {
                        errors.push(`${parentNum}: Guardian Relationship is required when Guardian is selected`);
                    }
                }

                // Check contact number
                const contactInput = entry.querySelector(`input[name="parent-contact-${index}"]`);
                const contactValue = contactInput.value.trim();
                if (!contactValue) {
                    errors.push(`${parentNum}: Contact Number is required`);
                } else if (contactValue.length !== 10 || !/^[0-9]{10}$/.test(contactValue)) {
                    errors.push(`${parentNum}: Contact Number must be exactly 10 digits`);
                }

                // Check Aadhaar for primary parent only
                if (index === 0) {
                    const aadhaarInput = entry.querySelector(`input[name="parent-aadhaar-${index}"]`);
                    const aadhaarValue = aadhaarInput.value.trim();
                    if (!aadhaarValue) {
                        errors.push(`${parentNum}: Aadhaar Number is required`);
                    } else if (aadhaarValue.length !== 12 || !/^[0-9]{12}$/.test(aadhaarValue)) {
                        errors.push(`${parentNum}: Aadhaar Number must be exactly 12 digits`);
                    }
                }
            });

            // Check if at least one parent is selected as primary contact
            const allPrimaryCheckboxes = document.querySelectorAll('input[name^="parent-primary-"]');
            let isPrimarySelected = false;

            allPrimaryCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    isPrimarySelected = true;
                }
            });

            if (!isPrimarySelected) {
                errors.push('At least one parent/guardian must be selected as the primary contact for emergencies');
            }

            // Display errors if any
            if (errors.length > 0) {
                errorText.innerHTML = '⚠️ Please correct the following errors:<br><br>' +
                    errors.map(error => `• ${error}`).join('<br>');
                errorMessage.classList.remove('hidden');

                // Scroll to error message
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Auto-hide after 8 seconds
                setTimeout(() => {
                    errorMessage.classList.add('hidden');
                }, 8000);

                return;
            }

            // Hide error message if validation passes
            errorMessage.classList.add('hidden');

            // If validation passes, submit the form
            alert('Form submitted successfully! All parent/guardian information has been saved.');
            // Here you would typically submit the form data to your server
        }


