 const learningObjectives = [
      {
        objective_id: "OBJ001",
        program_id: "playgroup",
        title: "Develop Fine Motor Skills",
        description: "Children will improve hand-eye coordination through play activities",
        month: "January",
        year: 2024
      },
      {
        objective_id: "OBJ002",
        program_id: "playgroup",
        title: "Express Through Music",
        description: "Children will participate in music and movement activities",
        month: "February",
        year: 2024
      },
      {
        objective_id: "OBJ003",
        program_id: "preprimary1",
        title: "Recognize Letters and Sounds",
        description: "Children will identify uppercase and lowercase letters",
        month: "January",
        year: 2024
      },
      {
        objective_id: "OBJ004",
        program_id: "preprimary1",
        title: "Count to 20",
        description: "Children will count objects and recognize numbers 1-20",
        month: "February",
        year: 2024
      },
      {
        objective_id: "OBJ005",
        program_id: "preprimary2",
        title: "Beginning Reading Skills",
        description: "Children will blend simple words and read short sentences",
        month: "January",
        year: 2024
      },
      {
        objective_id: "OBJ006",
        program_id: "preprimary2",
        title: "Basic Addition and Subtraction",
        description: "Children will solve simple math problems using manipulatives",
        month: "February",
        year: 2024
      },
      {
        objective_id: "OBJ007",
        program_id: "preprimary3",
        title: "Reading Comprehension",
        description: "Children will read and understand age-appropriate books",
        month: "January",
        year: 2024
      },
      {
        objective_id: "OBJ008",
        program_id: "preprimary3",
        title: "Problem Solving Skills",
        description: "Children will solve multi-step problems independently",
        month: "February",
        year: 2024
      }
    ];
    const defaultStudentConfig = {
          modal_title: "Student Evaluation",
          search_placeholder: "Search students...",
          save_button_text: "Save Evaluations",
          primary_color: "#4f46e5",
          secondary_color: "#ffffff",
          text_color: "#1f2937",
          success_color: "#10b981",
          working_color: "#f59e0b",
          font_family: "Inter, system-ui, -apple-system, sans-serif",
          font_size: 16
        };

        let evaluations = [];
        let pendingChanges = new Map(); // Track unsaved changes
        let currentProgramId = "";
        let currentObjectiveId = "";
        let searchTerm = "";
        let initialStudentOrder = []; // Store initial order based on loaded data
function populateProgramSelect() {
      const select = document.getElementById('program-select');
      programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program.id;
        option.textContent = `${program.name} (${program.ageRange})`;
        select.appendChild(option);
      });
    }

    function getEvaluation(studentId, objectiveId) {
      return evaluations.find(e => e.student_id === studentId && e.objective_id === objectiveId);
    }

    function getPendingStatus(studentId) {
      const key = `${studentId}_${currentObjectiveId}`;
      return pendingChanges.get(key);
    }

    function getStudentsForProgram(programId) {
      return students.filter(s => s.enrolled_programs.includes(programId));
    }

    // Calculate student order based on current evaluations
    function calculateStudentOrder() {
      let studentsList = getStudentsForProgram(currentProgramId);

      return studentsList.sort((a, b) => {
        const evalA = getEvaluation(a.student_id, currentObjectiveId);
        const evalB = getEvaluation(b.student_id, currentObjectiveId);

        const statusA = evalA ? evalA.status : 'not_evaluated';
        const statusB = evalB ? evalB.status : 'not_evaluated';

        // Achieved students go to bottom
        if (statusA === 'achieved' && statusB !== 'achieved') return 1;
        if (statusA !== 'achieved' && statusB === 'achieved') return -1;

        // Sort by last name for same status
        return a.last_name.localeCompare(b.last_name);
      });
    }

    function updateSaveButtonState() {
      const saveBtn = document.getElementById('save-btn');
      const countText = document.getElementById('evaluation-count');
      const config = window.elementSdk ? window.elementSdk.config : defaultConfig;
      const baseSize = config.font_size || defaultConfig.font_size;
      const customFont = config.font_family || defaultConfig.font_family;
      const baseFontStack = 'Inter, system-ui, -apple-system, sans-serif';

      if (pendingChanges.size > 0) {
        saveBtn.disabled = false;
        countText.textContent = `${pendingChanges.size} evaluation${pendingChanges.size > 1 ? 's' : ''} pending`;
        countText.style.fontSize = `${baseSize * 0.875}px`;
        countText.style.fontFamily = `${customFont}, ${baseFontStack}`;
      } else {
        saveBtn.disabled = true;
        countText.textContent = 'No changes to save';
        countText.style.fontSize = `${baseSize * 0.875}px`;
        countText.style.fontFamily = `${customFont}, ${baseFontStack}`;
      }
    }

    function renderEvalStudentList() {
      const container = document.getElementById('eval-student-list');
      const config = window.elementSdk ? window.elementSdk.config : defaultConfig;

      if (!currentProgramId || !currentObjectiveId) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 text-sm sm:text-base">Select a program and learning objective to view students</p>';
        return;
      }

      // Use the initial order or filter by search
      let studentsList = [...initialStudentOrder];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        studentsList = studentsList.filter(s =>
          s.first_name.toLowerCase().startsWith(lowerSearch) ||
          s.last_name.toLowerCase().startsWith(lowerSearch) ||
          s.student_id.toLowerCase().startsWith(lowerSearch)
        );
      }

      if (studentsList.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 text-sm sm:text-base">No students found</p>';
        return;
      }

      const baseSize = config.font_size || defaultConfig.font_size;
      const customFont = config.font_family || defaultConfig.font_family;
      const baseFontStack = 'Inter, system-ui, -apple-system, sans-serif';
      const secondaryColor = config.secondary_color || defaultConfig.secondary_color;
      const textColor = config.text_color || defaultConfig.text_color;
      const successColor = config.success_color || defaultConfig.success_color;
      const workingColor = config.working_color || defaultConfig.working_color;

      container.innerHTML = studentsList.map(student => {
        const pendingData = getPendingStatus(student.student_id);
        const evaluation = getEvaluation(student.student_id, currentObjectiveId);

        let status = evaluation ? evaluation.status : 'not_evaluated';
        let isEdited = evaluation && evaluation.status === 'edited';
        let isPending = false;

        if (pendingData !== undefined) {
          isPending = true;
          if (typeof pendingData === 'object') {
            status = pendingData.status;
          } else {
            status = pendingData;
          }
        }

        return `
          <div class="student-card bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm ${isPending ? 'ring-2 ring-yellow-400' : ''}" style="background-color: ${secondaryColor};">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
              <div class="flex-grow w-full sm:w-auto">
                <h3 style="font-size: ${baseSize * 1.25}px; font-family: ${customFont}, ${baseFontStack}; color: ${textColor};" class="font-bold mb-1">
                  ${student.first_name} ${student.last_name}
                  ${isPending ? '<span class="text-yellow-600 text-sm ml-2">●</span>' : ''}
                </h3>
                <p style="font-size: ${baseSize * 0.875}px; font-family: ${customFont}, ${baseFontStack}; color: ${textColor};" class="text-gray-600">
                  Grade ${student.grade} • ${student.student_id}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 ${status === 'achieved' || isEdited ? 'cursor-not-allowed' : 'cursor-pointer'}">
                  <input
                    type="checkbox"
                    ${status === 'achieved' ? 'checked disabled' : ''}
                    ${isEdited ? 'disabled' : ''}
                    onchange="handleCheckboxChange('${student.student_id}', this.checked)"
                    class="w-6 h-6 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 ${status === 'achieved' || isEdited ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
                    style="accent-color: ${successColor};"
                  >
                  <span style="font-size: ${baseSize * 0.875}px; font-family: ${customFont}, ${baseFontStack}; color: ${textColor};" class="font-medium">
                    ${status === 'achieved' ? 'Goal Achieved' : isEdited ? 'Status Edited' : 'Working Towards Goal'}
                  </span>
                </label>
                ${status === 'achieved' ? `
                  <button
                    onclick="openEditModal('${student.student_id}')"
                    class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded transition-colors"
                    style="font-size: ${baseSize * 0.875}px; font-family: ${customFont}, ${baseFontStack};"
                    title="Edit status"
                  >
                    ✎ Edit
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    let editingStudentId = null;

    function handleCheckboxChange(studentId, isChecked) {
      const key = `${studentId}_${currentObjectiveId}`;
      if (isChecked) {
        pendingChanges.set(key, 'achieved');
      } else {
        pendingChanges.delete(key);
      }
      updateSaveButtonState();
      renderEvalStudentList();
    }

    function openEditModal(studentId) {
      editingStudentId = studentId;
      document.getElementById('edit-reason-input').value = '';
      document.getElementById('edit-reason-modal').classList.remove('hidden');
    }

    function closeEditModal() {
      editingStudentId = null;
      document.getElementById('edit-reason-modal').classList.add('hidden');
    }

    function confirmEdit() {
      const reason = document.getElementById('edit-reason-input').value.trim();
      if (!reason) {
        showMessage('Please provide a reason for editing', 'error');
        return;
      }

      const key = `${editingStudentId}_${currentObjectiveId}`;
      pendingChanges.set(key, { status: 'edited', reason: reason });
      updateSaveButtonState();
      renderEvalStudentList();
      closeEditModal();
      showMessage('Status change queued. Click Save to apply.', 'success');
    }

    async function saveAllEvaluations() {
      const saveBtn = document.getElementById('save-btn');
      const originalText = saveBtn.textContent;

      if (evaluations.length + pendingChanges.size > 999) {
        showMessage('Maximum limit of 999 evaluations reached. Please delete some evaluations first.', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      let successCount = 0;
      let errorCount = 0;

      for (const [key, pendingData] of pendingChanges.entries()) {
        const [studentId, objectiveId] = key.split('_');
        const existingEval = getEvaluation(studentId, objectiveId);

        let finalStatus, finalNotes;
        if (typeof pendingData === 'object') {
          finalStatus = pendingData.status;
          finalNotes = pendingData.reason || '';
        } else {
          finalStatus = pendingData;
          finalNotes = '';
        }

        if (existingEval) {
          const updatedEval = {
            ...existingEval,
            status: finalStatus,
            evaluated_date: new Date().toISOString(),
            notes: finalNotes
          };
          const result = await window.dataSdk.update(updatedEval);
          if (result.isOk) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          const newEval = {
            student_id: studentId,
            program_id: currentProgramId,
            objective_id: objectiveId,
            status: finalStatus,
            evaluated_date: new Date().toISOString(),
            notes: finalNotes
          };
          const result = await window.dataSdk.create(newEval);
          if (result.isOk) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      pendingChanges.clear();
      updateSaveButtonState();

      saveBtn.textContent = originalText;

      if (errorCount > 0) {
        showMessage(`Saved ${successCount} evaluations, ${errorCount} failed. Please try again.`, 'error');
      } else {
        showMessage(`Successfully saved ${successCount} evaluation${successCount > 1 ? 's' : ''}!`, 'success');
      }
    }

    function showMessage(text, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-4 rounded-lg shadow-lg z-[10001] max-w-md text-center`;
      messageDiv.textContent = text;
      document.body.appendChild(messageDiv);
      setTimeout(() => messageDiv.remove(), 4000);
    }

    // Event listeners
 /*   document.getElementById('open-modal-btn').addEventListener('click', () => {
      document.getElementById('evaluation-modal').classList.remove('hidden');
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
      document.getElementById('evaluation-modal').classList.add('hidden');
    });
    document.getElementById('evaluation-modal').addEventListener('click', (e) => {
      if (e.target.id === 'evaluation-modal') {
        document.getElementById('evaluation-modal').classList.add('hidden');
      }
    });
*/
  function changeProgramSelectEval(selectElement){
        var theValue = selectElement.options[selectElement.selectedIndex].value;
        currentProgramId = theValue;
      pendingChanges.clear();

      const objectiveSelect = document.getElementById('objective-select');
      objectiveSelect.innerHTML = '<option value="">Select an objective</option>';

      if (currentProgramId) {
        objectiveSelect.disabled = false;
        const objectives = learningObjectives.filter(obj => obj.program_id === currentProgramId);
        objectives.forEach(obj => {
          const option = document.createElement('option');
          option.value = obj.objective_id;
          option.textContent = `${obj.title} (${obj.month} ${obj.year})`;
          objectiveSelect.appendChild(option);
        });
      } else {
        objectiveSelect.disabled = true;
      }

      updateSaveButtonState();
      renderEvalStudentList();
    }

    document.getElementById('objective-select').addEventListener('change', (e) => {
      currentObjectiveId = e.target.value;
      pendingChanges.clear();

      if (currentObjectiveId) {
        // Calculate and store initial order when objective is selected
        initialStudentOrder = calculateStudentOrder();
      }

      updateSaveButtonState();
      renderEvalStudentList();
    });

    document.getElementById('student-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderEvalStudentList();
    });

    document.getElementById('save-btn').addEventListener('click', saveAllEvaluations);

    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal);
    document.getElementById('confirm-edit-btn').addEventListener('click', confirmEdit);

    document.getElementById('edit-reason-modal').addEventListener('click', (e) => {
      if (e.target.id === 'edit-reason-modal') {
        closeEditModal();
      }
    });

    window.handleCheckboxChange = handleCheckboxChange;
    window.openEditModal = openEditModal;