/**
 * @desc 解决浮动运算问题，避免小数点后产生多位数和计算精度损失。
 *
 * 问题示例：2.3 + 2.4 = 4.699999999999999，1.0 - 0.9 = 0.09999999999999998
 */

type NumberType = number | string;

/**
 * Correct the given number to specifying significant digits.
 *
 * @param num The input number
 * @param precision An integer specifying the number of significant digits
 *
 * @example strip(0.09999999999999998) === 0.1 // true
 */
export const strip = (num: NumberType, precision = 15): number => {
    return +parseFloat(Number(num).toPrecision(precision));
};

