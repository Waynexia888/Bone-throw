
import { connect } from 'react-redux';
import { signup } from '../../actions/session_actions';
import SignupForm from './signup_form';

const mSTP = (state) => {
    return {
        signedIn: state.session.isSignedIn,
        errors: state.errors
    };
};

const mDTP = (dispatch) => {
    return {
        signup: user => dispatch(signup(user))
    }
}

export default connect(mSTP,mDTP)(SignupForm);



// import { connect } from 'react-redux';
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { signup } from '../../actions/session_actions';
// import SignUpForm from './signup_form';

// const mSTP = ({ errors }) => {
//     return {
//         errors: errors.session,
//         formType: 'signup',
//         navLink: <Link to="/login">Log in instead</Link>,
//     };
// };

// const mDTP = dispatch => {
//     return {
//         action: (user) => dispatch(signup(user)),
//     };
// };

// export default connect(mSTP, mDTP)(SignUpForm);
