use soroban_sdk::{contracttype, contracterror, Address, BytesN, Vec, Map, U256, Env};

#[derive(Clone)]
#[contracttype]
pub enum LogicType {
    And,
    Or,
}

#[derive(Clone)]
#[contracttype]
pub enum ConditionType {
    TokenBalance,
    NftOwnership,
    TxCount,
}

#[derive(Clone)]
#[contracttype]
pub struct Condition {
    pub condition_type: ConditionType,
    pub asset: Option<BytesN<32>>,
    pub collection_id: Option<BytesN<32>>,
    pub operator: Option<BytesN<4>>,
    pub value: Option<U256>,
}

#[derive(Clone)]
#[contracttype]
pub struct Policy {
    pub id: BytesN<32>,
    pub creator: Address,
    pub name: Vec<u8>,
    pub description: Vec<u8>,
    pub logic_type: LogicType,
    pub conditions: Vec<Condition>,
    pub expiration_seconds: U256,
    pub active: bool,
    pub created_at: U256,
    pub updated_at: U256,
}

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum PolicyError {
    PolicyNotFound = 1,
    PolicyAlreadyExists = 2,
    NotPolicyCreator = 3,
    PolicyInactive = 4,
    InvalidCondition = 5,
}

#[contract]
pub struct PolicyRegistry;

impl PolicyRegistry {
    pub fn create_policy(
        e: Env,
        creator: Address,
        name: Vec<u8>,
        description: Vec<u8>,
        logic_type: LogicType,
        conditions: Vec<Condition>,
        expiration_seconds: U256,
    ) -> Result<BytesN<32>, PolicyError> {
        let policy_id = Self::generate_policy_id(&e);
        let timestamp = e.ledger().timestamp();

        let policy = Policy {
            id: policy_id.clone(),
            creator,
            name,
            description,
            logic_type,
            conditions,
            expiration_seconds,
            active: true,
            created_at: timestamp,
            updated_at: timestamp,
        };

        let key = policy_id.clone();
        e.storage().instance().set(&key, &policy);

        policy_id
    }

    pub fn update_policy(
        e: Env,
        creator: Address,
        policy_id: BytesN<32>,
        name: Vec<u8>,
        description: Vec<u8>,
        logic_type: LogicType,
        conditions: Vec<Condition>,
        expiration_seconds: U256,
    ) -> Result<(), PolicyError> {
        let key = policy_id.clone();
        let mut policy: Policy = e.storage()
            .instance()
            .get(&key)
            .ok_or(PolicyError::PolicyNotFound)?;

        if policy.creator != creator {
            return Err(PolicyError::NotPolicyCreator);
        }

        policy.name = name;
        policy.description = description;
        policy.logic_type = logic_type;
        policy.conditions = conditions;
        policy.expiration_seconds = expiration_seconds;
        policy.updated_at = e.ledger().timestamp();

        e.storage().instance().set(&key, &policy);

        Ok(())
    }

    pub fn disable_policy(
        e: Env,
        creator: Address,
        policy_id: BytesN<32>,
    ) -> Result<(), PolicyError> {
        let key = policy_id.clone();
        let mut policy: Policy = e.storage()
            .instance()
            .get(&key)
            .ok_or(PolicyError::PolicyNotFound)?;

        if policy.creator != creator {
            return Err(PolicyError::NotPolicyCreator);
        }

        policy.active = false;
        policy.updated_at = e.ledger().timestamp();

        e.storage().instance().set(&key, &policy);

        Ok(())
    }

    pub fn get_policy(e: Env, policy_id: BytesN<32>) -> Result<Policy, PolicyError> {
        let key = policy_id;
        e.storage()
            .instance()
            .get(&key)
            .ok_or(PolicyError::PolicyNotFound)
    }

    pub fn is_policy_active(e: Env, policy_id: BytesN<32>) -> Result<bool, PolicyError> {
        let policy = Self::get_policy(e, policy_id)?;
        if !policy.active {
            return Err(PolicyError::PolicyInactive);
        }
        Ok(true)
    }

    fn generate_policy_id(e: &Env) -> BytesN<32> {
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
    fn test_create_policy() {
        let env = Env::default();
        env.mock_all_auths();

        let creator = Address::from_string(&"GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD".try_into().unwrap());
        let name = b"Test Policy".to_vec();
        let description = b"A test policy".to_vec();
        let logic_type = LogicType::And;
        let conditions = Vec::new(&env);
        let expiration_seconds = U256::from_u32(&env, 3600);

        let policy_id = PolicyRegistry::create_policy(
            env.clone(),
            creator,
            name,
            description,
            logic_type,
            conditions,
            expiration_seconds,
        ).unwrap();

        let policy = PolicyRegistry::get_policy(env.clone(), policy_id).unwrap();
        assert!(policy.active);
    }
}