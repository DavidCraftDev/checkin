import { ExclamationCircleIcon, CheckCircleIcon, MinusCircleIcon } from "@heroicons/react/24/solid";

function TrafficLight(props: { status: "GREEN" | "YELLOW" | "RED" }) {
    if (props.status === "GREEN") {
        return <CheckCircleIcon className="w-6 h-6 text-green-500 inline-block" title="Grün - Anwesend" />
    } else if (props.status === "YELLOW") {
        return <MinusCircleIcon className="w-6 h-6 text-yellow-500 inline-block" title="Gelb - Verspätet/Teilweise" />
    } else {
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500 inline-block" title="Rot - Abwesend/Störend" />
    }
}

export default TrafficLight;
