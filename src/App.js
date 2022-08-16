import { useReducer } from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"
import "./App.css"

//all of the different actions that can be done on the calculator
export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
}

function reducer(state, { type, payload }) {
  switch (type) {
    // ---------------ADD OPERATION---------------------
    case ACTIONS.ADD_DIGIT:
      //once the answer has been evaluated clicking back onto the calculator will override the input and start fresh
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      //check if the user isnt typing in 0000000 and fix it to 0
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      //check if user has already entered one . and dont allow another .
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }
      //return a value to go into the currentOperand part of embedded html
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    // ---------------CHOOSE OPERATION---------------------
    case ACTIONS.CHOOSE_OPERATION:
      //if no values are chosen dont do anything
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      //over ride an operation if you have clicked an operation already and has been sent to previous
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }
      //updates the output to change the current operand into the previous operand 
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }
      //default operation to return the value of the previous (operation) current and set it to previous
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }
    //---------------CLEAR OPERATION---------------------
    case ACTIONS.CLEAR:
      return {}
    // ---------------DELETE OPERATION---------------------
    case ACTIONS.DELETE_DIGIT:
      // If already evaluated an answer - reset all values
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      // Nothing to delete so dont do anything to the state
      if (state.currentOperand == null) return state
      //If there is only one thing in the currentoperand delete it and set to null rather than an empty string
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }
      // remove just the last digit if the currentoperand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }
    //---------------EVALUATE OPERATION---------------------
    case ACTIONS.EVALUATE:
      //checking that all different pices of information needed are there - two operands and an operation
      //if there are values that are not there dont change anything and retuyrn the current state
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      //pass the full values through and return the answer using the evaluiate function and display as a currentoperand
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  //convert strings into numbers to evaluate
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  //check the values are numbers
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  //change the output answer depending on the operation used
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
  }
  //change the values of the computation back into a string that can be displayed as previousOperand
  return computation.toString()
}

//formatting the output so that there are no fractions
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})
//formatting the output
function formatOperand(operand) {
  //do nothing if there is no operand
  if (operand == null) return
  //split the operand into two parts 6.57  => integer=6 decimal=57
  const [integer, decimal] = operand.split(".")
  //return an integer as the standard 3 digits per comma
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  //return the values that will be embedded into the html
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer,{})

  //html returned
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  )
}

export default App