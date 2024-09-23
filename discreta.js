
function format_input(a, b, c) {
  return `${a}*f(n) = ${b}*f(n-1) + ${c}*f(n-2)`;
}

function format_equation(a, b, c) {
  let sign_b = (-b < 0) ? "-" : "+";
  let sign_c = (-c < 0) ? "-" : "+";
  return `${a}\lambda_{n+2} ${sign_b} ${Math.abs(b)}\lambda_{n+1} ${sign_c} ${Math.abs(c)}\lambda_{n} = 0`;
}

// Solves equations of the form: f(n) = a*f(n-1) + b
function first_order_solver(a, b) {
  // Formula: f(n) = a^(n-1)*f(1) - b*(a^(n-1) - 1)/(a - 1)
  let result;

  let c = b / (a - 1);
  if (c === 0) {
    result = `f(n) = ${a}^{n-1}f(1)`;
  }
  else if (Number.isInteger(b) && Number.isInteger(a)) {
    let c_numerator = b;
    let c_denominator = a - 1;
  
    // Negative sign only on the numerator
    if (c_denominator < 0) {
      c_numerator *= -1;
      c_denominator *= -1;
    }

    // Simplify the fraction by the greatest common divisor
    let x = gcd(c_numerator, c_denominator);
    c_numerator /= x;
    c_denominator /= x;

    let frac = format_fraction(c_numerator, c_denominator, false);
  
    result = `f(n) = ${a}^{n-1} \\left(f(1) + ${frac} \\right) - ${frac}`;
  }
  else {
    result = `f(n) = ${a}^{n-1}f(1) + ${c}(${a}^{n-1} - 1)`;
  }

  return result.replace(" 1^{n-1}", "");
}

document.addEventListener("DOMContentLoaded", () => {
  let aInput = document.querySelector(".v1")
  let bInput = document.querySelector(".v2")
  let cInput = document.querySelector(".v3")

  const atualizarEquacao = () => {
    let a = aInput.value;
    let b = bInput.value;
    let c = cInput.value;
    
    document.querySelector("#equacao").innerHTML = `$$${a}\\lambda_{n+2} + ${b}\\lambda_{n+1} + ${c}\\lambda_{n} = 0$$`;
    MathJax.typeset();
  };

  aInput.addEventListener("input", atualizarEquacao);
  bInput.addEventListener("input", atualizarEquacao);
  cInput.addEventListener("input", atualizarEquacao);
  
  atualizarEquacao();
});

function user_click() {
  let a = parseFloat(document.querySelector(".v1").value)
  let b = parseFloat(document.querySelector(".v2").value)
  let c = parseFloat(document.querySelector(".v3").value)

  let res = second_order_solver(a, b, c)
  document.querySelector("#resposta").innerHTML = `$$${res}$$`

  MathJax.typeset();
}

// Resolve equações da forma: a*f(n) = b*f(n-1) + c*f(n-2) => a*f(n) - b*f(n-1) - c*f(n-2) = 0
function second_order_solver(a, b, c) {
  
  // Transformar coeficientes da equação a*f(n) = b*f(n-1) + c*f(n-2)
  // para os da equação a*f(n) - b*f(n-1) - c*f(n-2) = 0.
  b = -b;
  c = -c;

  let delta = b**2 - 4 * a * c;
  let sqrt_delta = Math.sqrt(Math.abs(delta));
  
  let root1_denominator = 2 * a;
  let root2_denominator = 2 * a;
  
  let root1_numerator;
  let root2_numerator;
  
  //
  let polar_form_complex = "";

  // Double rooted
  if (delta === 0) {
    root1_numerator = -b;

    // Simplify the fraction by the greatest common divisor
    let x = gcd(root1_numerator, root1_denominator);
    root1_numerator /= x;
    root1_denominator /= x;
    
    root2_numerator = root1_numerator;
    root2_denominator = root1_denominator;
  }
  else if (Number.isInteger(sqrt_delta) && delta > 0) {
    root1_numerator = -b + sqrt_delta;
    root2_numerator = -b - sqrt_delta;

    // Simplify the fraction by the greatest common divisor
    let x = gcd(root1_numerator, root1_denominator);
    root1_numerator /= x;
    root1_denominator /= x;

    let x2 = gcd(root2_numerator, root2_denominator);
    root2_numerator /= x2;
    root2_denominator /= x2;
  }
  else {
    let inside_root = Math.abs(delta);
    let outside_root = 1;
    
    // Simplify square root
    if (Number.isInteger(delta)) {
      let factor = 2;

      while(factor**2 < inside_root) {
        if (inside_root % factor**2 == 0) {
          inside_root /= factor**2;
          outside_root *= factor;
        } 
        else {
          (factor === 2) ? factor++ : factor += 2;
        }
      }
    }

    // Simplify fraction
    let x_tmp = gcd(outside_root, b);
    let x3 = gcd(x_tmp, root1_denominator);
    b /= x3;
    outside_root /= x3;
    root1_denominator /= x3;
    root2_denominator /= x3;

    if (outside_root === 1) outside_root = "";
    root1_numerator = `${-b} + ${outside_root}\\sqrt{${inside_root}}`.replace("0 + ", "").replace("\\sqrt{1}", "");
    root2_numerator = `${-b} - ${outside_root}\\sqrt{${inside_root}}`.replace("0 - ", "").replace("\\sqrt{1}", "");

    // Add i and polar norm for complex roots
    if (delta < 0) {
      root1_numerator = `${root1_numerator}i`.replace("1i", "i");
      root2_numerator = `${root2_numerator}i`.replace("1i", "i");

      // Re(z) = -b/2a, Im(z) = sqrt|delta|/2a = sqrt(-delta)/2a
      let theta = Math.atan(Math.sqrt(-delta)/(-b)).toFixed(3);
      let phi_numerator = 4 * a * c;
      let phi_denominator = (4 * a**2);

      // Simplify the fraction by the greatest common divisor
      let x = gcd(phi_numerator, phi_denominator);
      phi_numerator /= x;
      phi_denominator /= x;

      polar_form_complex = (phi_numerator == phi_denominator) ? 
      ` \\approx k_1cos(${theta}n) + k_2sen(${theta}n)i` :
      ` \\approx ${format_fraction(phi_numerator, phi_denominator)}^n(k_1cos(${theta}n) + k_2sen(${theta}n)i)`;
    }
  }

  // Format roots
  let root1 = format_fraction(root1_numerator, root1_denominator);
  let root2 = format_fraction(root2_numerator, root2_denominator);

  // Write recurrence equation in LaTeX
  if (root1_numerator == root2_numerator) {
    return `f(n) = ${root1}^n(nc_2 + c_1)`.replace("1^n", "");
  }
  else {
    return `f(n) = c_1${root1}^n + c_2${root2}^n${polar_form_complex}`.replace("1^n", "");
  } 
}

function gcd(a,b) {
  a = Math.abs(a);
  b = Math.abs(b);

  // Swap so that a >= b
  if (b > a) {
    let temp = a;
    a = b;
    b = temp;
  }

  // Euclidian Algorithm
  while (true) {
      if (b == 0) return a;
      a %= b;
      if (a == 0) return b;
      b %= a;
  }
}

function format_fraction(numerator, denominator, place_parentheses = true) {
  if (denominator === 1) {
    let result = `\\left(${numerator}\\right)`;

    // Remove parentheses if not asked for or if root is just a number (not an expression like 1 + sqrt(5)).
    if (
      (Number.isInteger(numerator) && numerator > 0) || 
      numerator.length === 1 || 
      !place_parentheses
    ) 
        result = result.slice(6, -7);

    return result;
  } 
  else {
    if (place_parentheses) return `\\left(\\dfrac{${numerator}}{${denominator}}\\right)`;
    return `\\dfrac{${numerator}}{${denominator}}`;
  }
}
