const request = require( 'supertest' );
const app = require( './index' );
const {connectDb, closeConnection, connection } = require('./db');

beforeEach( ( done ) =>
{
    connectDb(connection);
    done();
} )

afterEach( ( done ) =>
{
    closeConnection(connection);
    done();
} )

//Test routes
describe( "Test Routes", () =>
{
    test( 'Test Get users', async () =>
    { 
        await request( app )
            .get( "/users" )
            .expect( 200 )
            .then( ( response ) =>
            {
                expect( Array.isArray( response.body ) ).toBeTruthy()
                expect( response.body.length ).toEqual( 2 );
            })
     })
})

