import { mount } from 'enzyme';
import React from 'react';
import { getFormInstance, getWrapperInstance } from '../__test_utils__/getInput';
import immediate from '../__test_utils__/immediate';
import { InputFactory } from '../__test_utils__/TestInput';

import Formsy, { withFormsy } from '../src';
import { PassDownProps } from '../src/withFormsy';

class MyTest extends React.Component<{ type?: string } & PassDownProps<string>> {
  public static defaultProps = { type: 'text' };

  handleChange = (event) => {
    const { setValue } = this.props;
    setValue(event.target.value);
  };

  render() {
    const { type, value } = this.props;
    return <input type={type} value={value || ''} onChange={this.handleChange} />;
  }
}

const FormsyTest = withFormsy<{ type?: string }, string>(MyTest);

describe('Validation', () => {
  it('should reset only changed form element when external error is passed', () => {
    const form = mount(
      <Formsy onSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar', bar: 'foo' })}>
        <FormsyTest name="foo" />
        <FormsyTest name="bar" />
      </Formsy>,
    );

    const input = form.find('input').at(0);
    const inputComponents = form.find('Formsy(MyTest)');

    getFormInstance(form).submit();
    expect(getWrapperInstance(inputComponents.at(0)).isValid()).toEqual(false);
    expect(getWrapperInstance(inputComponents.at(1)).isValid()).toEqual(false);

    input.simulate('change', { target: { value: 'bar' } });
    immediate(() => {
      expect(getWrapperInstance(inputComponents.at(0)).isValid()).toEqual(true);
      expect(getWrapperInstance(inputComponents).isValid()).toEqual(false);
    });
  });

  it('should let normal validation take over when component with external error is changed', () => {
    const form = mount(
      <Formsy onSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
        <FormsyTest name="foo" validations="isEmail" />
      </Formsy>,
    );

    const input = form.find('input');
    const inputComponent = form.find('Formsy(MyTest)');

    getFormInstance(form).submit();
    expect(getWrapperInstance(inputComponent).isValid()).toEqual(false);

    input.simulate('change', { target: { value: 'bar' } });
    immediate(() => {
      expect(getWrapperInstance(inputComponent).getValue()).toEqual('bar');
      expect(getWrapperInstance(inputComponent).isValid()).toEqual(false);
    });
  });

  it('should trigger an onValid handler, if passed, when form is valid', () => {
    const onValid = jest.fn();
    const onInvalid = jest.fn();

    mount(
      <Formsy onValid={onValid} onInvalid={onInvalid}>
        <FormsyTest name="foo" value="bar" required />
      </Formsy>,
    );

    expect(onValid).toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
  });

  it('should trigger an onInvalid handler, if passed, when form is invalid', () => {
    const onValid = jest.fn();
    const onInvalid = jest.fn();

    mount(
      <Formsy onValid={onValid} onInvalid={onInvalid}>
        <FormsyTest name="foo" required />
      </Formsy>,
    );

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
  });

  it('should trigger the `onInvalid` handler if a required element receives `null` as the value', () => {
    const onValid = jest.fn();
    const onInvalid = jest.fn();

    mount(
      <Formsy onValid={onValid} onInvalid={onInvalid}>
        <FormsyTest value={null} name="foo" required />
      </Formsy>,
    );

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
  });

  it('should be able to use provided validate function', () => {
    let isValid = false;
    const CustomInput = InputFactory({
      componentDidMount() {
        isValid = this.props.isValid;
      },
    });
    mount(
      <Formsy>
        <CustomInput name="foo" value="foo" required />
      </Formsy>,
    );

    expect(isValid).toEqual(true);
  });

  it('should provide invalidate callback on onValidSubmit', () => {
    function TestForm() {
      return (
        <Formsy onValidSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
          <FormsyTest name="foo" value="foo" />
        </Formsy>
      );
    }

    const form = mount(<TestForm />);

    const formEl = form.find('form');
    const input = form.find('Formsy(MyTest)');
    formEl.simulate('submit');
    expect(getWrapperInstance(input).isValid()).toEqual(false);
  });

  it('should provide invalidate callback on onInvalidSubmit', () => {
    function TestForm() {
      return (
        <Formsy onInvalidSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
          <FormsyTest name="foo" value="foo" validations="isEmail" />
        </Formsy>
      );
    }

    const form = mount(<TestForm />);
    const formEl = form.find('form');
    const input = form.find('Formsy(MyTest)');
    formEl.simulate('submit');
    expect(getWrapperInstance(input).getErrorMessage()).toEqual('bar');
  });

  it('should not invalidate inputs on external errors with preventExternalInvalidation prop', () => {
    function TestForm() {
      return (
        <Formsy preventExternalInvalidation onSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
          <FormsyTest name="foo" value="foo" />
        </Formsy>
      );
    }

    const form = mount(<TestForm />);
    const formEl = form.find('form');
    const input = form.find('Formsy(MyTest)');
    formEl.simulate('submit');
    expect(getWrapperInstance(input).isValid()).toEqual(true);
  });

  it('should invalidate inputs on external errors without preventExternalInvalidation prop', () => {
    function TestForm() {
      return (
        <Formsy onSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
          <FormsyTest name="foo" value="foo" />
        </Formsy>
      );
    }

    const form = mount(<TestForm />);
    const formEl = form.find('form');
    const input = form.find('Formsy(MyTest)');
    formEl.simulate('submit');
    expect(getWrapperInstance(input).isValid()).toEqual(false);
  });

  it('should throw errors on invalid validation string', () => {
    const mockConsoleError = jest.spyOn(console, 'error');
    mockConsoleError.mockImplementation(() => {
      // do nothing
    });

    function TestForm() {
      return (
        <Formsy onInvalidSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
          <FormsyTest name="foo" value="foo" validations="isLength:3:7" />
        </Formsy>
      );
    }

    expect(() => mount(<TestForm />)).toThrow(
      'Formsy does not support multiple args on string validations. Use object format of validations instead.',
    );

    mockConsoleError.mockRestore();
  });

  it('should throw errors on missing input name', () => {
    const mockConsoleError = jest.spyOn(console, 'error');
    mockConsoleError.mockImplementation(() => {
      // do nothing
    });

    function TestForm() {
      return (
        <Formsy onInvalidSubmit={(_model, _reset, invalidate) => invalidate({ foo: 'bar' })}>
          <FormsyTest name="" value="foo" />
        </Formsy>
      );
    }

    expect(() => mount(<TestForm />)).toThrow('Form Input requires a name property when used');

    mockConsoleError.mockRestore();
  });
});
