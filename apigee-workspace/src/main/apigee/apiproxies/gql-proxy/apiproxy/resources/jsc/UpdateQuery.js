var query = context.getVariable("graphqlquery").replace(/\n/g, "\n");
context.setVariable("newQuery", JSON.stringify({ "query": query}) );