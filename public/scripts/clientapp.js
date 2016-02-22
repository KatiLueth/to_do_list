$(document).ready(function() {
    getData();
    $('#do-button').on('click', addTask);
    $('.lists').on('click', '.complete', taskComplete);
    $('.lists').on('click', '.delete', deleteTask);
});

function addTask() {
    event.preventDefault();
    var tasks = {};
// add 3 input fields at top of page
    $.each($('#task-assigner').serializeArray(), function(i, field) {
    tasks[field.name] = field.value;
        tasks.complete = 'false';
    });

// clear form:
    console.log('tasks:: ', tasks);
    $('#task-assigner').find('input[type=text]').val('');

// ajax call post to database
    $.ajax({
        type: 'POST',
        url: '/new',
        data: tasks,
        success: function(data) {
            if(data) {
                // everything went ok
                console.log('from server:', data);
                getData();

            } else {
                alert('Please enter a time and date for your task to be complete!');
                console.log('error');
            }
        }
    });
}

function getData() {

    $.ajax({
        type: 'GET',
        url: '/new',
        success: function(data) {
            appendToDom(data);
            console.log(data);
        }
    });
}

function appendToDom(data) {
    // remove to re-append
    $('.newDiv').remove();
    // for loop to read data from database
    for (var i = 0; i < data.length; i++) {
        // if else statement with boolean == false:: move to appropriate section
        if(data[i].complete == false) {
            console.log(data[i].complete);

            var newDiv = $('.do-list').append('<div class="newDiv"></div>');
            $('.do-list').children().last().append('<button class="delete" data-id="' + data[i].id + '" type="radio" name="delete">DELETE</button>');
            $('.do-list').children().last().append('<button class="complete" data-id="' + data[i].id + '" type="radio" name="complete">COMPLETE</button>');
            $('.do-list').children().last().append('<div data-id="' + data[i].id + '">' + data[i].task + ' ' + data[i].goal_time + ' '
                + data[i].goal_date + '</div>');

            } else {
            var newDiv = $('.done-list').append('<div class="newDiv"></div>');
            $('.done-list').children().last().append('<button class="delete" data-id="' + data[i].id + '" type="radio" name="delete">DELETE</button>');
            $('.done-list').children().last().append('<button class="complete" data-id="' + data[i].id + '" type="radio" name="complete">COMPLETE</button>');
            $('.done-list').children().last().append('<div data-id="' + data[i].id + '">' + data[i].task + ' ' + data[i].goal_time + ' '
                + data[i].goal_date + '</div>');
        }
    }
}

//// delete from database & DOM
function deleteTask(){
    var deleteId = {};
    deleteId.id = $(this).data('id');
    console.log(deleteId);

    // remove from DOM
   $(this).parent().remove();
    // update to delete from database too.
    $.ajax({
        type: 'POST',
        url: '/delete',
        data: deleteId,
        success: function(data) {
            if(data) {
                // everything went ok
                console.log('from server:', data);
                getData();
            } else {
                alert('We seem to be having an issue with your request.');
                console.log('error');
            }
        }
    });
}

// change status in DOM, update completed tasks to 'done' list
function taskComplete() {
    var changeStatus = {};
    changeStatus.complete = $(this).data('id');
    console.log(changeStatus);

    //update database to change boolean status
    $.ajax({
        type: 'POST',
        url: '/complete',
        data: changeStatus,
        success: function (data) {
            if (data) {
                // everything went ok
                console.log('from server:', data);
                getData();
            } else {
                alert('We seem to be having an issue with your request.');
                console.log('error');
            }
        }
    });
}