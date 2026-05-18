use soroban_sdk::{contracttype, contracterror, Address, BytesN, Vec, U256, Env};

#[derive(Clone)]
#[contracttype]
pub struct AccessToken {
    pub id: BytesN<32>,
    pub wallet: Address,
    pub policy_id: BytesN<32>,
    pub issued_at: U256,
    pub expires_at: U256,
    pub active: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum AccessTokenError {
    TokenNotFound = 1,
    TokenExpired = 2,
    TokenRevoked = 3,
    Unauthorized = 4,
    PolicyNotActive = 5,
}

#[contract]
pub struct AccessTokenContract;

impl AccessTokenContract {
    pub fn mint_access(
        e: Env,
        admin: Address,
        wallet: Address,
        policy_id: BytesN<32>,
        expiration_seconds: U256,
    ) -> Result<BytesN<32>, AccessTokenError> {
        let token_id = Self::generate_token_id(&e);
        let current_time = e.ledger().timestamp();
        let expires_at = current_time + expiration_seconds;

        let token = AccessToken {
            id: token_id.clone(),
            wallet: wallet.clone(),
            policy_id,
            issued_at: current_time,
            expires_at,
            active: true,
        };

        let key = token_id.clone();
        e.storage().instance().set(&key, &token);

        token_id
    }

    pub fn revoke_access(
        e: Env,
        admin: Address,
        token_id: BytesN<32>,
    ) -> Result<(), AccessTokenError> {
        let key = token_id;
        let mut token: AccessToken = e.storage()
            .instance()
            .get(&key)
            .ok_or(AccessTokenError::TokenNotFound)?;

        token.active = false;
        e.storage().instance().set(&key, &token);

        Ok(())
    }

    pub fn verify_access(
        e: Env,
        token_id: BytesN<32>,
    ) -> Result<AccessToken, AccessTokenError> {
        let key = token_id;
        let token: AccessToken = e.storage()
            .instance()
            .get(&key)
            .ok_or(AccessTokenError::TokenNotFound)?;

        if !token.active {
            return Err(AccessTokenError::TokenRevoked);
        }

        let current_time = e.ledger().timestamp();
        if token.expires_at < current_time {
            return Err(AccessTokenError::TokenExpired);
        }

        Ok(token)
    }

    pub fn get_access_token(e: Env, token_id: BytesN<32>) -> Result<AccessToken, AccessTokenError> {
        let key = token_id;
        e.storage()
            .instance()
            .get(&key)
            .ok_or(AccessTokenError::TokenNotFound)
    }

    pub fn is_access_valid(e: Env, token_id: BytesN<32>) -> Result<bool, AccessTokenError> {
        match Self::verify_access(e, token_id) {
            Ok(_) => Ok(true),
            Err(AccessTokenError::TokenExpired) => Ok(false),
            Err(AccessTokenError::TokenRevoked) => Ok(false),
            Err(e) => Err(e),
        }
    }

    fn generate_token_id(e: &Env) -> BytesN<32> {
        let timestamp = e.ledger().timestamp();
        let sequence = e.ledger().sequence();
        let random = e.environ().compute_hash(&[timestamp, sequence]);
        BytesN::from_array(e, &random)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as TestAddress;

    #[test]
    fn test_mint_access() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::from_string(&"GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD".try_into().unwrap());
        let wallet = Address::from_string(&"GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGQZNP5SRRX7DWT".try_into().unwrap());
        let policy_id = BytesN::from_array(&env, &[0u8; 32]);
        let expiration = U256::from_u32(&env, 3600);

        let token_id = AccessTokenContract::mint_access(
            env.clone(),
            admin,
            wallet,
            policy_id,
            expiration,
        ).unwrap();

        let token = AccessTokenContract::get_access_token(env.clone(), token_id).unwrap();
        assert!(token.active);
    }
}