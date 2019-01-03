var defs = 0;

var locked = '🔒';
var unlocked = '🔓';

$(document).ready(function() {
    $.getJSON('./js/defs.json', function(data) {
        defs = data;
        console.log('successfully loaded defs.json');
        setBindings();
        run();
    });
});

function populateDept() {
    $('#dept').empty();
    $.each(defs.depts, function(i, dept) {
        var option = $('<option>', {
            label: dept.name,
            value: dept.name,
            html: dept.name
        });
        option.appendTo('#dept');
    });
}

function populateJob(deptName) {
    // Avoiding a REALLY annoying jquery ui bug here.
    $('#job').selectmenu().selectmenu('destroy').empty();
    $.each(defs.depts, function(i, dept) {
        if (dept.name == deptName) {
            $.each(dept.jobs, function(j, job) {
                var option = $('<option>', {
                    label: job.titles[0],
                    value: job.titles[0],
                    html: job.titles[0]
                });
                option.appendTo('#job');
            });
            $('#job').selectmenu().trigger('selectmenuchange');
            // Avoiding a format break by resetting our control group, if it exists yet
            $('div.ui-controlgroup#groupJob').controlgroup('destroy').controlgroup();
        }
    });
}

function populateJobFromDept() {
    return populateJob($('#dept').val());
}

function populateTitle(jobName) {
    $('#title').selectmenu().selectmenu('destroy').empty();
    var titles;
    $.each(defs.depts, function(i, dept) {
        $.each(dept.jobs, function(i, job) {
            if (job.titles[0] == jobName) {
                titles = job.titles;
            }
        });
    });
    titles.forEach(function(title) {
        var option = $('<option>', {
            label: title,
            value: title,
            html: title
        });
        option.appendTo('#title');
    });
    $('#titles').selectmenu().trigger('selectmenuchange');
    $('div.ui-controlgroup#groupTitle').controlgroup('destroy').controlgroup();
    return 1;
}

function populateTitleFromJob() {
    return populateTitle($('#job').val());
}

function populateBranch(deptName, jobName) {
    $('#branch').selectmenu().selectmenu('destroy').empty();
    for (var d = 0; d < defs.depts.length; d++) {
        var dept = defs.depts[d];
        if (dept.name != deptName) {
            continue;
        }
        for (var j = 0; j < dept.jobs.length; j++) {
            var job = dept.jobs[j];
            if (job.titles[0] != jobName) {
                continue;
            }
            var branches = [];
            if (job.rates.ec) {
                branches.push('ec');
            }
            if (job.rates.fleet) {
                branches.push('fleet');
            }
            if (job.rates.scg) {
                branches.push('scg');
            }
            if (job.rates.civ) {
                branches.push('civ');
            }
            for (var b = 0; b < branches.length; b++) {
                var branchOption = $('<option>', {
                    label: defs.branches[branches[b]].desc,
                    value: branches[b],
                    html: defs.branches[branches[b]].desc
                })
                branchOption.appendTo('#branch');
            }
            break;
        }
        break;
    }
    $('#branch').selectmenu().trigger('selectmenuchange');
    // Avoiding a format break by resetting our control group, if it exists yet
    $('div.ui-controlgroup#groupBranch').controlgroup('destroy').controlgroup();
}

function populateBranchFromJob() {
    return populateBranch($('#dept').val(), $('#job').val());
}

function populateRate(deptName, jobName, branch) {
    $('#rate').selectmenu().selectmenu('destroy').empty();
    for (var d = 0; d < defs.depts.length; d++) {
        var dept = defs.depts[d];
        if (dept.name != deptName) {
            continue;
        }
        for (var j = 0; j < dept.jobs.length; j++) {
            var job = dept.jobs[j];
            if (job.titles[0] != jobName) {
                continue;
            }
            var rates = job.rates[branch];
            for (var r = 0; r < rates.length; r++) {
                var rateName = getRateName(branch, rates[r])
                var option = $('<option>', {
                    label: rateName,
                    value: rateName,
                    html: rateName
                });
                option.appendTo('#rate');
            }
            $('#rate').selectmenu().trigger('selectmenuchange');
            // Avoiding a format break by resetting our control group, if it exists yet
            $('div.ui-controlgroup#groupRate').controlgroup('destroy').controlgroup();
            return 1;
        }
    }
}

function getRateName(branch, rate) {
    for (var i = 0; i < defs.branches[branch].rates.length; i++) {
        if (defs.branches[branch].rates[i].rate == rate) {
            return defs.branches[branch].rates[i].name;
        }
    }
    return -1;
}

function populateRateFromJob() {
    return populateRate($('#dept').val(), $('#job').val(), $('#branch').val());
}

function setBindings() {
    console.log('setting bindings');

    $('#dept').on('selectmenuchange', function() {
        populateJobFromDept();
    });
    $('#job').on('selectmenuchange', function() {
        populateTitleFromJob();
        populateBranchFromJob();
    });
    $('#branch').on('selectmenuchange', function() {
        populateRateFromJob();
    })

    $('#roll').on('click', roll);

    $('#lockDept').change(function() {
        if (this.checked) {

        } else {
            check($('#lockJob'), false);
            check($('#lockTitle'), false);
        }
        setLock($('#lockDept'));
    });

    $('#lockJob').change(function() {
        if (this.checked) {
            check($('#lockDept'), true);
        } else {
            check($('#lockTitle'), false);
            check($('#lockBranch'), false);
            check($('#lockRate'), false);
        }
        setLock($('#lockJob'));
    });

    $('#lockTitle').change(function() {
        if (this.checked) {
            check($('#lockDept'), true);
            check($('#lockJob'), true);
        } else {

        }
        setLock($('#lockTitle'));
    });

    $('#lockBranch').change(function() {
        if (this.checked) {

        } else {
            check($('#lockRate'), false);
        }
        setLock($('#lockBranch'));
    });

    $('#lockRate').change(function() {
        if (this.checked) {
            check($('#lockDept'), true);
            check($('#lockJob'), true);
            check($('#lockBranch'), true);
        } else {

        }
        setLock($('#lockRate'));
    });
}

function check(checkbox, value) {
    checkbox.prop({
        'checked': value
    }).checkboxradio('refresh');
    setLock(checkbox);
}

function setLock(checkbox) {
    var lockIcon = unlocked;
    if (checkbox[0].checked) {
        lockIcon = locked;
    }
    checkbox.labels().children().filter('.lock').html(lockIcon);
    return lockIcon == locked;
}

function run() {
    console.log('running');

    populateDept();

    $('button').button();
    $('div.controlgroup').controlgroup();
    $('select').selectmenu();

    roll();
}

function roll() {
    if(!$('#lockDept').prop('checked')) {
        randomize($('#dept'));
    }
    if(!$('#lockJob').prop('checked')) {
        randomize($('#job'));
    }
    if(!$('#lockTitle').prop('checked')) {
        randomize($('#title'));
    }
    if(!$('#lockBranch').prop('checked')) {
        randomize($('#branch'));
    }
    if(!$('#lockRate').prop('checked')) {
        randomize($('#rate'));
    }
}

function randomValue(element) {
    var children = element.children();
    return children[Math.floor(Math.random() * children.length)]['value'];
}

function randomize(element) {
    var oldValue = element.val();
    var newValue = randomValue(element);
    while (oldValue == newValue && element.children().length > 1) {
        newValue = randomValue(element);
    }
    element.val(newValue);
    element.selectmenu('refresh', true);
    element.trigger('selectmenuchange');
    return 1;
}