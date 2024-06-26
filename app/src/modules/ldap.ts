const ldap = require('ldapjs');

const tlsOptions = {rejectUnauthorized: false}

let client: any

if(process.env.ldap === 'true') {
const url = process.env.LDAP_URI
client = ldap.createClient({
    url: [url + ':636', url + ':636'],
    tlsOptions: tlsOptions
});
}

function unbind() {
    client.unbind((err: any, any: any) => {
        if (err) throw new Error("LDAP unbind failed: " + err);
        console.log("LDAP unbind successful")
    });
}

export function connectBind() {
const username = process.env.LDAP_BIND_DN
const password = process.env.LDAP_BIND_CREDENTIALS
client.bind(
    username, password,
    (any: any) => {testLdap()}
)
return "LDAP bind successful"
}

function testLdap() {
    let data: any = []
    let options = {
        filter: '(|(sAMAccountName=ntadmin)(mail=ntadmin))',
        scope: 'sub',
        attributes: ['*']
    };
    const base = process.env.test
    client.search(base, options, (err: any, res: any) => {
        res.on('searchRequest', (searchRequest: any) => {
            console.log('searchRequest: ', searchRequest.messageId);
        });
        res.on('searchEntry', (entry: any) => {
            console.log('entry: ' + JSON.stringify(entry.pojo));
            data.push(entry)
        });
        res.on('searchReference', (referral: any) => {
            console.log('referral: ' + referral.uris.join());
        });
        res.on('error', (err: any) => {
            console.error('error: ' + err.message);
        });
        res.on('end', (result: any) => {
            console.log('status: ' + result.status);
            console.log('data: ' + JSON.stringify(data));
        });
    });
    unbind()
}

