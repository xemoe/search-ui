import React from "react";
import { FacetContainer } from "../Facet";
import { shallow } from "enzyme";

const View = () => <div />;

const params = {
  view: jest.fn().mockImplementation(props => <View {...props} />),
  field: "field1",
  label: "Field 1",
  filters: [
    {
      field: "field1",
      values: ["field1value1"],
      type: "all"
    }
  ],
  facets: {
    field1: [
      {
        field: "field1",
        data: [
          { count: 20, value: "field1value1" },
          { count: 10, value: "field1value2" }
        ],
        type: "value"
      }
    ],
    field2: [
      {
        field: "field2",
        data: [{ count: 10, value: "field2value1" }],
        type: "value"
      }
    ],
    field3: [
      {
        field: "field3",
        data: [],
        type: "value"
      }
    ]
  },
  addFilter: jest.fn(),
  removeFilter: jest.fn(),
  setFilter: jest.fn()
};

beforeEach(() => {
  params.view.mockClear();
  params.addFilter.mockClear();
  params.removeFilter.mockClear();
  params.setFilter.mockClear();
});

it("renders correctly", () => {
  const wrapper = shallow(<FacetContainer {...params} />);
  expect(wrapper).toMatchSnapshot();
});

it("should not render a Facet if there are no facets available", () => {
  const wrapper = shallow(
    <FacetContainer
      {...{
        ...params,
        facets: {}
      }}
    />
  );

  expect(wrapper.html()).toEqual(null);
});

describe("values view prop", () => {
  function subject(filterType) {
    let viewProps;
    shallow(
      <FacetContainer
        {...params}
        field="field1"
        filterType={filterType}
        filters={[
          {
            field: "field2",
            values: ["field1value1"],
            type: "none"
          },
          {
            field: "field1",
            values: ["field1value1", "field1value2"],
            type: "all"
          },
          {
            field: "field1",
            values: ["field1value1"],
            type: "any"
          }
        ]}
        facets={{
          field1: [
            {
              field: "field1",
              data: [
                { count: 20, value: "field1value1" },
                { count: 10, value: "field1value2" }
              ],
              type: "value"
            }
          ]
        }}
        view={props => (viewProps = props)}
      />
    );
    return viewProps;
  }
  it("should correctly calculated the selected facet options", () => {
    const { values } = subject();
    expect(values).toEqual(["field1value1", "field1value2"]);
  });

  it("should correctly calculated the selected facet options for filterType", () => {
    const { values } = subject("any");
    expect(values).toEqual(["field1value1"]);
  });
});

describe("show more", () => {
  let wrapper;

  function subject(additionalProps = {}) {
    return shallow(
      <FacetContainer
        {...{
          ...params,
          field: "field1",
          facets: {
            field1: [
              {
                field: "field1",
                data: [
                  { count: 20, value: "field1value1" },
                  { count: 10, value: "field1value2" },
                  { count: 9, value: "field1value3" },
                  { count: 8, value: "field1value4" },
                  { count: 7, value: "field1value5" },
                  { count: 6, value: "field1value6" },
                  { count: 5, value: "field1value7" },
                  { count: 4, value: "field1value8" },
                  { count: 3, value: "field1value9" },
                  { count: 2, value: "field1value10" },
                  { count: 1, value: "field1value11" },
                  { count: 1, value: "field1value12" },
                  { count: 1, value: "field1value13" },
                  { count: 1, value: "field1value14" },
                  { count: 1, value: "field1value15" },
                  { count: 1, value: "field1value16" },
                  { count: 1, value: "field1value17" }
                ],
                type: "value"
              }
            ]
          },
          ...additionalProps
        }}
      />
    );
  }

  beforeAll(() => {
    wrapper = subject();
  });

  it("should limit options to 5 initially", () => {
    expect(wrapper.find(View).prop("options").length).toEqual(5);
  });

  it("should start at more than 5 initially if a show prop is passed", () => {
    const initialCount = 10;
    const newWrapper = subject({ show: initialCount });
    expect(newWrapper.find(View).prop("options").length).toEqual(initialCount);
  });

  it("should have a show more button", () => {
    expect(wrapper.find(View).prop("showMore")).toEqual(true);
  });

  describe("after a show more click", () => {
    beforeAll(() => {
      wrapper.find(View).prop("onMoreClick")();
    });

    it("should have 10 more options", () => {
      expect(wrapper.find(View).prop("options").length).toEqual(15);
    });

    it("should still have a show more button", () => {
      expect(wrapper.find(View).prop("showMore")).toEqual(true);
    });
  });

  describe("after more more show more click", () => {
    beforeAll(() => {
      wrapper.find(View).prop("onMoreClick")();
    });

    it("should be showing all options", () => {
      expect(wrapper.find(View).prop("options").length).toEqual(17);
    });

    it("should hide the show more button", () => {
      expect(wrapper.find(View).prop("showMore")).toEqual(false);
    });
  });
});

it("will add a filter when a facet value is selected with onSelect", () => {
  const wrapper = shallow(<FacetContainer {...params} filterType="any" />);

  wrapper.find(View).prop("onSelect")("field1value2");

  const [fieldName, fieldValue, filterType] = params.addFilter.mock.calls[0];
  expect(fieldName).toEqual("field1");
  expect(fieldValue).toEqual("field1value2");
  expect(filterType).toEqual("any");
});

it("will overwrite a filter when a facet value is selected with onChange", () => {
  const wrapper = shallow(<FacetContainer {...params} filterType="any" />);

  wrapper.find(View).prop("onChange")("field1value2");

  const [fieldName, fieldValue, filterType] = params.setFilter.mock.calls[0];
  expect(fieldName).toEqual("field1");
  expect(fieldValue).toEqual("field1value2");
  expect(filterType).toEqual("any");
});

it("will remove a filter when a facet value removed", () => {
  const wrapper = shallow(<FacetContainer {...params} filterType="any" />);

  wrapper.find(View).prop("onRemove")("field1value2");

  const [fieldName, fieldValue, filterType] = params.removeFilter.mock.calls[0];
  expect(fieldName).toEqual("field1");
  expect(fieldValue).toEqual("field1value2");
  expect(filterType).toEqual("any");
});

it("will remove a filter when a facet value removed, defaulting filterType to all", () => {
  const wrapper = shallow(<FacetContainer {...params} />);

  wrapper.find(View).prop("onRemove")("field1value2");

  const [fieldName, fieldValue, filterType] = params.removeFilter.mock.calls[0];
  expect(fieldName).toEqual("field1");
  expect(fieldValue).toEqual("field1value2");
  expect(filterType).toEqual("all");
});

it("passes className through to the view", () => {
  let viewProps;
  const className = "test-class";
  shallow(
    <FacetContainer
      {...params}
      className={className}
      view={props => (viewProps = props)}
    />
  );
  expect(viewProps.className).toEqual(className);
});
