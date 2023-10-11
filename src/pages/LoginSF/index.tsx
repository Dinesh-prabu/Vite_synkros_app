import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import LOGO_IMG from "../../assets/logo.svg";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { SetStateAction, useState } from "react";

const LoginSF = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");

  const handleSubmit = () => {
    if (token) {
      localStorage.setItem("auth", token);
      navigate("/dashboard");
    } else {
      alert("Enter Auth Token with KonamiAuth");
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-wrapper__logo">
          <img src={LOGO_IMG} alt="Synkros" />
        </div>
        <div className="login-wrapper__formblk">
          <div className="login-wrapper__container">
            <TextBoxComponent
              type="textbox"
              placeholder={"Enter Auth Token"}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setToken(e.target.value)}
              cssClass={`e-outline custom-form__input  && "e-error"
                                }`}
              multiline={true}
              floatLabelType="Auto"
              id="username"
            />

            <div
              className="login-wrapper__button"
              onClick={() => handleSubmit()}
            >
              <ButtonComponent
                cssClass="e-primary custom-form__button custom-form--primary"
                id="submit"
              >
                {"Sign In"}
              </ButtonComponent>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSF;
