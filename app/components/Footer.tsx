import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full md:w-6/12 px-4 mx-auto text-center">
            <div className="text-sm text-blueGray-500 font-semibold py-1">
              &copy; {new Date().getFullYear()}&nbsp; Made with ❤️ by{" "}
              <a
                href="https://pulkitkrverma.tech"
                className="text-[#61dafb] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pulkit K. Verma.
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;