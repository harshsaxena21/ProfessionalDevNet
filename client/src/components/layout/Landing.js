import React from 'react'
import { Link, Redirect } from 'react-router-dom';
import { connect } from "react-redux";
import PropTypes from "prop-types";


const Landing = ({ isAuthenticated }) => {
	if (isAuthenticated) {
  	return <Redirect to='/dashboard' />;
	}

	return (
    <section class="landing">
      <div class="dark-overlay">
        <div class="landing-inner">
          <h1 class="x-large">Developer Community</h1>
          <p class="lead">
            Create a developer profile, share experience/advice and gain Knowledge from
            other developers
          </p>
          <div class="buttons">
            <Link to="/register" class="btn btn-lg btn-primary round">
              <i class="fas fa-user-plus"></i> Sign Up
            </Link>
            <Link to="/login" class="btn btn-lg btn-outline-primary round">
              <i class="fas fa-sign-in-alt"></i> Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

Landing.propTypes = {
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);

