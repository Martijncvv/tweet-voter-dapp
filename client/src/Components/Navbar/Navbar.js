import './Navbar.css'
import React from 'react'

const TwitterLogo = require('../../static/twitter_logo.png')

const Navbar = ({ infoBar, sortingOption, setSortingOption }) => {
	const handleSortingChange = (_sortingOption) => {
		setSortingOption(_sortingOption)
	}

	return (
		<nav className="navbar navbar-light bg-light">
			<span className="navbar-brand mb-0 ">
				<img
					src={TwitterLogo}
					alt="twitt3r orange logo"
					width="24"
					height="20"
					className="d-inline-block align-text-top mx-1"
				/>
				Twitt3r Orange
			</span>

			{infoBar && (
				<div className="alert alert-info w-50 " role="alert">
					{infoBar}
				</div>
			)}

			<div
				className="col-2 btn btn-group-toggle "
				aria-label="Basic example"
				data-toggle="buttons"
			>
				<button
					type="button"
					className={
						sortingOption === 'date'
							? 'btn btn-primary mx-1'
							: 'btn btn-outline-primary mx-1'
					}
					onClick={() => handleSortingChange('date')}
				>
					Date
				</button>
				<button
					type="button"
					className={
						sortingOption === 'likes'
							? 'btn btn-primary mx-1'
							: 'btn btn-outline-primary mx-1'
					}
					onClick={() => handleSortingChange('likes')}
				>
					Likes
				</button>
			</div>
		</nav>
	)
}

export default Navbar
