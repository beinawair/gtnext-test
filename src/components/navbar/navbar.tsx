import { NextPage } from 'next'

export const Navbar: NextPage<{ currentPage: string }> = ({ currentPage }) => {
  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-light main-navbar">
          <div className="container-fluid">
              <a className="navbar-brand text-white fw-bold" href="#"></a>
          </div>
      </nav>
    </>
  )
}