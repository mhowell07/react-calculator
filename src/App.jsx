import { useReducer, useCallback, useEffect } from "react"

// custom components
import DigitButton from "./components/DigitButton"
import OperationButton from "./components/OperationButton"

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

const reducer = (state, {type, payload}) => {
  switch(type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") return state
      if (payload.digit === "." && state.currentOperand == null) { return state } 
      if (payload.digit === "." && state.currentOperand.includes(".")) return state
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    case ACTIONS.CLEAR:
      return {
        ...state,
        operation: null,
        previousOperand: null,
        currentOperand: "",
      }
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      
      if (state.currentOperand == null) {
        return state
      }
      
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null
        }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }

    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: "0"
        }
      }

      return {
        ...state,
        operation: payload.operation,
        previousOperand: evaluate(state),
        currentOperand: "0",
      }
    case ACTIONS.EVALUATE:
      if (state.operation == null || state.currentOperand == null || state.previousOperand == null) {
        return state
      }

      return {
        ...state,
        overwrite: true,
        operation: null,
        previousOperand: null,
        currentOperand: evaluate(state),
      }
  }
}

const evaluate = ({currentOperand, previousOperand, operation}) => {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
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

  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})

const formatOperand = (operand) => {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) {
    return INTEGER_FORMATTER.format(integer)
  }
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer(
    reducer, 
    {currentOperand: "0"}
  );

  const handleKeyPress = useCallback((e) => {
    let digit = 0;
    let operation = "";
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]
    const operations = ["+", "-", "*"]
    if (digits.includes(e.key)) {
      digit = {digit: `${e.key}`}
      dispatch({type: ACTIONS.ADD_DIGIT, payload: digit})
    }
    if (operations.includes(e.key)) {
      operation = {operation: `${e.key}`}
      dispatch({type: ACTIONS.CHOOSE_OPERATION, payload: operation})
    }
    if (e.key === "/") {
      operation = {operation: "÷"}
      dispatch({type: ACTIONS.CHOOSE_OPERATION, payload: operation})
    }
    if (e.key === "Delete") {
      dispatch({type: ACTIONS.CLEAR})
    }
    if (e.key === "Backspace") {
      dispatch({type: ACTIONS.DELETE_DIGIT})
    }
    if (e.key === "Enter") {
      dispatch({type: ACTIONS.EVALUATE})
    }
  }, [])

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({type: ACTIONS.CLEAR})}>AC</button>
      <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}>DEL</button>
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
        onClick={() => dispatch({type: ACTIONS.EVALUATE})}  
      >=</button>
    </div>
  )
}

export default App
