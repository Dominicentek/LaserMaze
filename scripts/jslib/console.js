var console = {
    log: function(msg) {
        Java.type("java.lang.System").out.println(msg);
    }
}