// Store attendance records
    var attendanceRecords = {};
    var attendanceCurrentTimerID;
function getCurrentTime() {
        var useCurrentTime = document.getElementById('useCurrentTime').checked;

        if (useCurrentTime) {
            var now = new Date();
            return now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } else {
            var manualTime = document.getElementById('manualTime').value;
            if (manualTime) {
                // Convert 24-hour format to 12-hour format
                var timeParts = manualTime.split(':');
                var hours = parseInt(timeParts[0]);
                var minutes = timeParts[1];
                var ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // 0 should be 12
                return hours + ':' + minutes + ' ' + ampm;
            } else {
                showMessage('Please set a time first', 'error');
                return null;
            }
        }
    }

    function toggleTimeMode() {
        var useCurrentTime = document.getElementById('useCurrentTime').checked;
        var manualControls = document.getElementById('manualTimeControls');
        var currentTimeDisplay = document.getElementById('currentTimeDisplay');

        if (useCurrentTime) {
            manualControls.classList.add('hidden');
            currentTimeDisplay.classList.remove('hidden');
        } else {
            manualControls.classList.remove('hidden');
            currentTimeDisplay.classList.add('hidden');
        }
    }

    function setCurrentTimeInInput() {
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('manualTime').value = hours + ':' + minutes;
    }

    function updateLiveTime() {
        var now = new Date();
        var timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        var liveTimeElement = document.getElementById('liveTime');
        if (liveTimeElement) {
            liveTimeElement.textContent = timeString;
        }
    }

    function markTimeIn(studentName) {
        var currentTime = getCurrentTime();
        if (!currentTime) {
            return; // Error message already shown in getCurrentTime()
        }

        if (!attendanceRecords[studentName]) {
            attendanceRecords[studentName] = {};
        }
        attendanceRecords[studentName].timeIn = currentTime;
        attendanceRecords[studentName].timeOut = null;

        // Update the display
        populateAttendanceStudents();

        // Show success message
        showMessage(studentName + ' marked in at ' + currentTime, 'success');
    }

    function convertTimeToMinutes(timeString) {
        // Convert time string like "2:30 PM" to minutes since midnight
        var parts = timeString.split(' ');
        var timePart = parts[0];
        var ampm = parts[1];

        var timeParts = timePart.split(':');
        var hours = parseInt(timeParts[0]);
        var minutes = parseInt(timeParts[1]);

        // Convert to 24-hour format
        if (ampm === 'PM' && hours !== 12) {
            hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    function markTimeOut(studentName) {
        var currentTime = getCurrentTime();
        if (!currentTime) {
            return; // Error message already shown in getCurrentTime()
        }

        if (!attendanceRecords[studentName]) {
            attendanceRecords[studentName] = {};
        }

        // Validate that time out is after time in
        var timeInRecord = attendanceRecords[studentName].timeIn;
        if (timeInRecord) {
            var timeInMinutes = convertTimeToMinutes(timeInRecord);
            var timeOutMinutes = convertTimeToMinutes(currentTime);

            if (timeOutMinutes <= timeInMinutes) {
                showMessage('Time out must be later than time in (' + timeInRecord + ')', 'error');
                return;
            }
        }

        attendanceRecords[studentName].timeOut = currentTime;

        // Update the display
        populateAttendanceStudents();

        // Show success message
        showMessage(studentName + ' marked out at ' + currentTime, 'success');
    }

    function showMessage(message, type) {
        // Create toast message
        var toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-60 ' +
            (type === 'success' ? 'bg-green-500' : 'bg-red-500');
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(function() {
            document.body.removeChild(toast);
        }, 3000);
    }

    function submitAttendance() {
        // Get current date for the attendance record
        var today = new Date();
        var dateString = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Count students with attendance records
        var studentsWithAttendance = Object.keys(attendanceRecords).filter(function(studentName) {
            var record = attendanceRecords[studentName];
            return record.timeIn || record.timeOut;
        });

        if (studentsWithAttendance.length === 0) {
            showMessage('No attendance records to submit', 'error');
            return;
        }

        // Create attendance summary
        var summary = {
            date: dateString,
            timestamp: today.toISOString(),
            records: attendanceRecords,
            totalStudents: studentsWithAttendance.length
        };

        // Log the attendance data (in a real app, this would be sent to a server)
        console.log('Attendance Submitted:', summary);

        // Show success message with summary
        var message = 'Attendance submitted successfully! ' + studentsWithAttendance.length + ' student(s) recorded for ' + dateString;
        showMessage(message, 'success');

        document.getElementById('present-today').textContent = studentsWithAttendance.length;

        closeAttendanceModal();
        return;
        // Optional: Clear attendance records after submission
        // attendanceRecords = {};
        // populateAttendanceStudents();
    }

    function populateAttendanceStudents() {
        var enrolledStudents = currentData.filter(function(item) {
            return item.type === 'enrollment';
        });

        var optionsContainer = document.getElementById('attendance-student-options');

        if (enrolledStudents.length === 0) {
            optionsContainer.innerHTML = '<div class="p-3 text-gray-500 text-center">No students enrolled yet</div>';
            return;
        }

        // Sort students by name
        enrolledStudents.sort(function(a, b) {
            var nameA = (a.student.student_first_name + ' ' + a.student.student_last_name).toLowerCase();
            var nameB = (b.student.student_first_name + ' ' + b.student.student_last_name).toLowerCase();
            return nameA.localeCompare(nameB);
        });

        var html = '';
        for (var i = 0; i < enrolledStudents.length; i++) {
            var student = enrolledStudents[i].student;
            var studentName = student.student_first_name + ' ' + student.student_last_name;
            var age = calculateAge(student.student_dob);
            var program = programs.find(function(p) { return p.id === enrolledStudents[i].student_program; });
            var programName = program ? program.name : 'Unknown Program';

            // Get attendance record for this student
            var record = attendanceRecords[studentName] || {};
            var timeIn = record.timeIn || null;
            var timeOut = record.timeOut || null;

            html += '<div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">';

            // Student info section
            html += '<div class="flex justify-between items-start mb-3">';
            html += '<div>';
            html += '<div class="font-medium text-gray-900 text-lg">' + studentName + '</div>';
            html += '<div class="text-sm text-gray-600">Age: ' + age + ' years • ' + programName + '</div>';
            html += '</div>';
            html += '</div>';

            // Attendance section
            html += '<div class="border-t border-gray-100 pt-3">';
            html += '<div class="flex items-center justify-between">';

            // Time In section
            html += '<div class="flex items-center space-x-3">';
            if (timeIn) {
                html += '<div class="text-sm">';
                html += '<span class="text-gray-600">Time In:</span> ';
                html += '<span class="font-medium text-green-600">' + timeIn + '</span>';
                html += '</div>';
            } else {
                html += '<button onclick="markTimeIn(\'' + studentName + '\')" ';
                html += 'class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">';
                html += 'Mark Time In</button>';
            }
            html += '</div>';

            // Time Out section
            html += '<div class="flex items-center space-x-3">';
            if (timeOut) {
                html += '<div class="text-sm">';
                html += '<span class="text-gray-600">Time Out:</span> ';
                html += '<span class="font-medium text-red-600">' + timeOut + '</span>';
                html += '</div>';
            } else if (timeIn) {
                html += '<button onclick="markTimeOut(\'' + studentName + '\')" ';
                html += 'class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">';
                html += 'Mark Time Out</button>';
            } else {
                html += '<div class="text-sm text-gray-400">Mark in first</div>';
            }
            html += '</div>';

            html += '</div>';
            html += '</div>';
            html += '</div>';
        }

        optionsContainer.innerHTML = html;
    }
function closeAttendanceModal() {
        if(attendanceCurrentTimerID)
            clearInterval(attendanceCurrentTimerID);
        document.getElementById('attendanceModal').classList.add('hidden');
    }

    // Close modal when clicking outside of it
        document.addEventListener('click', function(event) {
            var modal = document.getElementById('attendanceModal');
            var modalContent = modal.querySelector('.bg-white');

            if (event.target === modal && !modalContent.contains(event.target)) {
                closeAttendanceModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeAttendanceModal();
            }
        });
