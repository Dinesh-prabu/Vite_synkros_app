import './style.scss';

type TheaderProps = {
    title: string
}

// maps the appropriate column to fields property
const fields = { text: 'theameName', value: 'Id' };
let themeCssName = "material.css";
const themeCss = localStorage.getItem("theme");
themeCssName = themeCss ? themeCss : themeCssName;
    console.log(themeCssName);
const onChange = (args: { isInteracted: any, value: any }) => {
    if (args.isInteracted) {
        localStorage.setItem("theme", args?.value);
        window.location.reload();
    } else {
        alert("Theme Not selected")
    }
}

const Header = (props: TheaderProps) => {
    const { title } = props;
    return <>
        <header className='header'>
            <h1>{title}</h1>
            <div className="dropdown">
                Header
            </div>
        </header>
    </>
}

export default Header