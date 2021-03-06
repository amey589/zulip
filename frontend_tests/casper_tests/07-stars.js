var common = require("../casper_lib/common.js");

function star_count() {
    return casper.evaluate(function () {
        return $("#zhome .fa-star:not(.empty-star)").length;
    });
}

function toggle_test_star_message() {
    var error = casper.evaluate(function () {
        var msg = $('.message_content:contains("test star"):visible').last();

        if (msg.length !== 1) {
            return "cannot find test star message";
        }

        var star_icon = msg.closest(".messagebox").find(".star");

        if (star_icon.length !== 1) {
            return "cannot find star icon";
        }

        star_icon.trigger("click");
    });

    if (error) {
        casper.test.info("\n\nERROR: " + error);
    }

    casper.test.assert(!error);
}

common.start_and_log_in();

casper.then(function () {
    casper.test.info("Sending test message");
});

common.then_send_message("stream", {
    stream: "Verona",
    subject: "stars",
    content: "test star",
});

casper.then(function () {
    common.wait_for_text("#zhome .message_row", "test star");
});

casper.then(function () {
    casper.test.info("Checking star counts");

    // Initially, no messages are starred.
    casper.test.assertEquals(star_count(), 0, "Got expected empty star count.");

    // Clicking on a message star stars it.
    toggle_test_star_message();
});

casper.then(function () {
    casper.waitUntilVisible("#zhome .fa-star", function () {
        casper.test.assertEquals(star_count(), 1, "Got expected single star count.");

        casper.click('a[href^="#narrow/is/starred"]');
    });
});

casper.waitUntilVisible("#zfilt", function () {
    // You can narrow to your starred messages.
    common.expected_messages("zfilt", ["Verona > stars"], ["<p>test star</p>"]);
    common.un_narrow();
});

casper.then(function () {
    // Clicking on a starred message unstars it.
    toggle_test_star_message();
    casper.test.assertEquals(star_count(), 0, "Got expected re-empty star count.");
});

common.then_log_out();

casper.run(function () {
    casper.test.done();
});
