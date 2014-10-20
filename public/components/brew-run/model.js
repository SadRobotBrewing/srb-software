define([
    'text!./template.html',
    'knockout',
    'run',
    'socket',
    'location'
], function(template, ko, run, socket, location) {
    function Model(params, componentInfo) {
        this.brew = run.brew;
        this.steps = run.steps;

        this.userOkay = function(criteriaIndex) {
            socket.emit("userOkay", criteriaIndex, function(error) {
                if (error) {
                    console.error(error);
                    return;
                }
            });
        };
    }

    return { viewModel: Model, template: template };
});
