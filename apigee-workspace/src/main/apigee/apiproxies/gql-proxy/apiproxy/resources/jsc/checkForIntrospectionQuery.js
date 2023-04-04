var query = context.proxyRequest.body.asJSON.query;
var variables = context.proxyRequest.body.asJSON.variables;
context.setVariable("graphqlquery", query);
context.setVariable("graphqlvariables",variables);

var regex = new RegExp('__schema', 'i');
if ( regex.test(query) ) {
    context.setVariable("skipParse",true);
}